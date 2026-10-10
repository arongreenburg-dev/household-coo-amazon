import { agent, type Message } from '@/lib/agent';
export async function POST(request:Request) {
 try {
  const body=await request.json();
  if(!Array.isArray(body.messages)||body.messages.length===0||body.messages.length>30||body.messages.some((m:Message)=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>4000)) return Response.json({error:'Please send a conversation of up to 30 messages.'},{status:400});
  return Response.json(await agent.reply(body.messages));
 } catch {return Response.json({error:'The request could not be read. Please try again.'},{status:400});}
}
