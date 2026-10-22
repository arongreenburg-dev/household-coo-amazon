import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BedrockModel,BedrockAgentService,BedrockObligationExtractor,validateHouseholdItems} from '../src/lib/bedrock';
import {items} from '../src/lib/household';
import {demoSources,scanSources,DemoSourceConnector,MockObligationExtractor} from '../src/lib/sources';
import type {ConverseCommandInput,ConverseCommandOutput} from '@aws-sdk/client-bedrock-runtime';
const response=(json:unknown):ConverseCommandOutput=>({$metadata:{},usage:{inputTokens:1,outputTokens:1,totalTokens:2},metrics:{latencyMs:1},output:{message:{role:'assistant',content:[{text:JSON.stringify(json)}]}},stopReason:'end_turn'});
test('scan retries a missing explanation once and returns only validated live output',async()=>{
 const source=demoSources.find(d=>d.id==='school-form')!;const item=items.find(i=>i.id==='permission')!;let calls=0;
 const model=new BedrockModel('demo-model','us-east-1',async input=>{
  calls++;if(calls===2)assert.match(input.system![0].text!,/previous response failed validation/);
  return response({results:[{sourceId:source.id,items:[calls===1?{...item,reason:null}:item]}]});
 });
 const [extracted]=await new BedrockObligationExtractor(model).extract(source);
 assert.equal(calls,2);assert.equal(extracted.reason,item.reason);
});
test('scan stops after two invalid outputs and does not retry credential failures',async()=>{
 const source=demoSources.find(d=>d.id==='school-form')!;let calls=0;
 const invalid=new BedrockModel('demo-model','us-east-1',async()=>{calls++;return response({results:[{sourceId:source.id,items:[{...items[0],reason:null}]}]});});
 await assert.rejects(new BedrockObligationExtractor(invalid).extract(source),/reason/);assert.equal(calls,2);
 calls=0;const denied=new BedrockModel('demo-model','us-east-1',async()=>{calls++;throw new Error('Access denied');});
 await assert.rejects(new BedrockObligationExtractor(denied).extract(source),/Access denied/);assert.equal(calls,1);
});
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

test('resolved parent conflicts override stale model interpretation',async()=>{
 const {applyDecisions}=await import('../src/lib/decisions');
 const state=applyDecisions(items,[{id:'dentist',resource:'Alex'}]);
 const model=new BedrockModel('demo-model','us-east-1',async()=>response({content:'There is still a conflict.',sourceIds:['dentist','soccer']}));
 const reply=await new BedrockAgentService(model).reply([{role:'user',content:'What conflicts do we have?'}],state);
 assert.match(reply.content,/no overlapping parent assignments/);
 assert.match(reply.content,/Alex is assigned to/);
 assert.match(reply.content,/Jamie is assigned to/);
 assert.doesNotMatch(reply.content,/still a conflict/);
});

test('scheduled intervals use source PM times and changed notices rather than model guesses',async()=>{
 const source={...demoSources.find(d=>d.id==='dental-notice')!,body:'Noah is scheduled May 21, 5:30–6:15 PM. Your booking lists Alex Morgan as the accompanying parent.'};
 const guessed={...items.find(i=>i.id==='dentist')!,start:'2026-05-20T03:30:00',end:'2026-05-20T04:15:00',prepare:null};
 const model=new BedrockModel('demo-model','us-east-1',async()=>response({results:[{sourceId:source.id,items:[guessed]}]}));
 const [event]=await new BedrockObligationExtractor(model).extract(source);
 assert.equal(event.start,'2026-05-21T17:30:00');
 assert.equal(event.end,'2026-05-21T18:15:00');
 assert.equal(event.due,event.start);
 assert.equal(event.resource,'Alex');
 assert.equal(event.prepare,undefined);
});

test('extraction normalizes combined family members and medium priority without accepting unknown people',async()=>{
 const source=demoSources.find(d=>d.id==='library-reminder')!;
 const make=(person:string)=>new BedrockObligationExtractor(new BedrockModel('demo-model','us-east-1',async()=>response({results:[{sourceId:source.id,items:[{...items.find(i=>i.id==='library')!,person,priority:'medium',prepare:null}]}]})));
 const [item]=await make('Ella and Noah').extract(source);
 assert.equal(item.person,'Family');assert.equal(item.priority,'normal');
 await assert.rejects(make('Unknown').extract(source),/classification/);
});
