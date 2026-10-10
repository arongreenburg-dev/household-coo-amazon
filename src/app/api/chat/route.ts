import { takeBedrockRequest } from '@/lib/request-budget';
import { type Message } from '@/lib/agent';
import { items } from '@/lib/household';
import { applyDecisions, validateDecisions } from '@/lib/decisions';
import { validateHouseholdItems } from '@/lib/bedrock';
import { getAgent, providerMode } from '@/lib/services';
export const maxDuration = 60;
export async function POST(request:Request) {
 let body;
 try {const raw=await request.text();if(raw.length>100000)throw new Error('Request too large.');body=JSON.parse(raw);} catch {return Response.json({error:'The request could not be read.'},{status:400});}
 let data;
 try {
  if(!body||!Array.isArray(body.messages)||body.messages.length===0||body.messages.length>30||body.messages.some((m:Message)=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>10000))throw new Error('Invalid conversation.');
  if(body.messages.reduce((sum:number,m:Message)=>sum+m.content.length,0)>20000)throw new Error('Conversation is too long.');
  data=applyDecisions(body.items?validateHouseholdItems(body.items):items,validateDecisions(body.decisions??[]));
 }catch{return Response.json({error:'Please send a valid conversation and demo plan.'},{status:400});}
 try {if(providerMode()==='bedrock'&&!takeBedrockRequest())return Response.json({error:'The demo AI request limit was reached. Wait a minute and try again.'},{status:429});return Response.json(await getAgent().reply(body.messages,data));}
 catch(error) {console.error('Household chat request failed',error instanceof Error?error.name:'UnknownError');return Response.json({error:providerMode()==='bedrock'?'Bedrock could not complete the request. Check model access, region, credentials and deployment logs. Your demo plan is unchanged.':'The assistant could not complete the request. Please retry.'},{status:503});}
}
