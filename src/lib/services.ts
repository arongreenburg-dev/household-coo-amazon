import { MockAgentService, type AgentService } from './agent';
import { MockObligationExtractor, type ObligationExtractor } from './sources';
import { BedrockModel, BedrockAgentService, BedrockObligationExtractor } from './bedrock';
export function providerMode(){const mode=process.env.HOUSEHOLD_AI_PROVIDER??'mock';if(!['mock','bedrock'].includes(mode))throw new Error('Unknown AI provider.');return mode as 'mock'|'bedrock';}
function model(){return new BedrockModel(process.env.BEDROCK_MODEL_ID??'',process.env.AWS_REGION??'');}
export function getAgent():AgentService{return providerMode()==='bedrock'?new BedrockAgentService(model()):new MockAgentService();}
export function getExtractor():ObligationExtractor{return providerMode()==='bedrock'?new BedrockObligationExtractor(model()):new MockObligationExtractor();}
