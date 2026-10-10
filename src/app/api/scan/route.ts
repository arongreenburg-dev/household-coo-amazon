import { scanSources } from '@/lib/sources';
export async function POST(){return Response.json(await scanSources());}
