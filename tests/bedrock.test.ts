import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BedrockModel,BedrockAgentService,BedrockObligationExtractor,validateHouseholdItems} from '../src/lib/bedrock';
import {items} from '../src/lib/household';
import {demoSources,scanSources,DemoSourceConnector,MockObligationExtractor} from '../src/lib/sources';
import type {ConverseCommandInput,ConverseCommandOutput} from '@aws-sdk/client-bedrock-runtime';
const response=(json:unknown):ConverseCommandOutput=>({$metadata:{},usage:{inputTokens:1,outputTokens:1,totalTokens:2},metrics:{latencyMs:1},output:{message:{role:'assistant',content:[{text:JSON.stringify(json)}]}},stopReason:'end_turn'});
test('Bedrock chat sends current plan and conversation through Converse, validates citations',async()=>{
 const requests:ConverseCommandInput[]=[];
 const model=new BedrockModel('demo-model','us-east-1',async input=>{requests.push(input);return response({content:'Alex can cover the dentist. The conflict is resolved in your demo plan.',sourceIds:['dentist','soccer']});});
 const reply=await new BedrockAgentService(model).reply([{role:'user',content:'Alex can take Noah to the dentist'}]);
 assert.equal(requests[0].modelId,'demo-model');
 const payload=JSON.parse(requests[0].messages![0].content![0].text!);
 assert.equal(payload.radar.conflicts.length,0);assert.equal(payload.household.find((i:{id:string})=>i.id==='dentist').resource,'Alex');
 assert.equal(reply.decisions?.[0].resource,'Alex');assert.equal(reply.sources.length,2);
 const invalid=new BedrockModel('demo-model','us-east-1',async()=>response({content:'Made-up claim',sourceIds:['not-a-source']}));
 await assert.rejects(new BedrockAgentService(invalid).reply([{role:'user',content:'hello'}]),/citations/);
});
test('Bedrock extraction batches all sources in one request and validates provenance',async()=>{
 const fixture=await scanSources(new DemoSourceConnector(),new MockObligationExtractor());let calls=0;
 const model=new BedrockModel('demo-model','us-east-1',async input=>{calls++;assert.equal(JSON.parse(input.messages![0].content![0].text!).documents.length,10);return response({results:fixture.provenance.map(p=>({sourceId:p.sourceId,items:p.itemIds.map(id=>items.find(i=>i.id===id))}))});});
 const result=await scanSources(new DemoSourceConnector(),new BedrockObligationExtractor(model));assert.equal(calls,1);assert.equal(result.items.length,8);assert.equal(result.informational,2);
 const bad=new BedrockModel('demo-model','us-east-1',async()=>response({results:[{sourceId:demoSources[0].id,items:[items.find(i=>i.id==='bill')]}]}));
 await assert.rejects(new BedrockObligationExtractor(bad).extract(demoSources[0]),/different source/);
});
test('malformed model output, truncation and invalid event data fail rather than fall back',async()=>{
 const invalid=new BedrockModel('demo-model','us-east-1',async()=>({$metadata:{},usage:{inputTokens:1,outputTokens:1,totalTokens:2},metrics:{latencyMs:1},output:{message:{role:'assistant',content:[{text:'not JSON'}]}},stopReason:'end_turn'}));
 await assert.rejects(invalid.json('system',{},100));
 const truncated=new BedrockModel('demo-model','us-east-1',async()=>({...response({}),stopReason:'max_tokens'}));await assert.rejects(truncated.json('system',{},100),/incomplete/);
 assert.throws(()=>validateHouseholdItems([{...items[1],end:items[1].start}]),/interval/);
 assert.throws(()=>validateHouseholdItems([{...items[0],person:'Unknown'}]),/classification/);
 for(const id of ['dentist','soccer']){
  const event={...items.find(item=>item.id===id)!};
  delete event.start;delete event.end;delete event.resource;
  assert.throws(()=>validateHouseholdItems([event]),/parent/);
 }
});

test('public Bedrock request limiter rejects excess requests and resets each minute',async()=>{const {takeBedrockRequest}=await import('../src/lib/request-budget');const now=1_000_000;for(let i=0;i<10;i++)assert.equal(takeBedrockRequest(now),true);assert.equal(takeBedrockRequest(now),false);assert.equal(takeBedrockRequest(now+60_000),true);});
