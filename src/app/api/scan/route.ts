import { takeBedrockRequest } from '@/lib/request-budget';
import { scanSources, DemoSourceConnector } from '@/lib/sources';
import { getExtractor, providerMode } from '@/lib/services';
export const maxDuration = 60;
export async function GET(){return Response.json({mode:providerMode()});}
export async function POST(){try{if(providerMode()==='bedrock'&&!takeBedrockRequest())return Response.json({error:'The demo AI request limit was reached. Wait a minute and retry.'},{status:429});return Response.json({...await scanSources(new DemoSourceConnector(),getExtractor()),mode:providerMode()});}catch(error){console.error('Household source scan failed',error instanceof Error?error.name:'UnknownError');return Response.json({error:'Source scan failed. If Bedrock is enabled, check model access, region, credentials and deployment logs. No new extraction was applied.'},{status:503});}}
