import { items, type HouseholdItem } from './household';
import { analyzeHousehold, tonightActions } from './reasoning';
export type Message = {role:'user'|'assistant';content:string};
export type AgentReply = {content:string; sources:string[]; suggestions:string[]};
// Implement this interface to connect a provider. Keep credentials and provider calls server-side.
export interface AgentService {reply(messages:Message[],data?:HouseholdItem[]):Promise<AgentReply>}
const suggestions=['What is most urgent?','What can wait?','What conflicts do we have?','What do I need to do tonight?'];
export class MockAgentService implements AgentService {
 async reply(messages:Message[],data:HouseholdItem[]=items):Promise<AgentReply> {
  const radar=analyzeHousehold(data); const question=messages.at(-1)?.content.toLowerCase()??'';
  let selected:HouseholdItem[]=[]; let content='';
  const list=(rows:HouseholdItem[])=>rows.map(i=>`• ${i.action}`).join('\n\n');
  if(/why|important|explain/.test(question)) {
   const previous=[...messages.slice(0,-1)].reverse().find(m=>m.role==='assistant')?.content.toLowerCase()??'';
   selected=data.filter(i=>question.includes(i.id)||question.includes(i.title.toLowerCase())||(/electric|bill/.test(question)&&i.id==='bill')||(/form|field trip/.test(question)&&i.id==='permission')||(/dentist/.test(question)&&i.id==='dentist'));
   if(!selected.length) selected=data.filter(i=>previous.includes(i.action.toLowerCase())||previous.includes(i.title.toLowerCase()));
   if(!selected.length) selected=radar.attention.slice(0,1);
   content=selected.map(i=>`${i.title}: ${i.reason}\n\nNext step: ${i.action}`).join('\n\n');
  } else if(/wait|later|defer/.test(question)) {selected=radar.wait;content=`These can wait until next week. Clear the time-sensitive items first.\n\n${list(selected)}`;}
  else if(/conflict|overlap|clash/.test(question)) {selected=data.filter(i=>radar.conflicts.some(c=>c.itemIds.includes(i.id)));content=radar.conflicts.length?radar.conflicts.map(c=>`${c.title}\n${c.detail}\n\nSuggested plan: ${c.action}`).join('\n\n'):'There are no overlapping assignments in the demo schedule.';}
  else if(/tonight|today|evening/.test(question)) {selected=tonightActions(data);content=`A manageable plan for tonight:\n\n${list(selected)}\n\nThat takes care of tomorrow’s deadline and gives you time to sort Wednesday’s rides.`;}
  else if(/urgent|priority|first/.test(question)) {selected=radar.attention;content=`Start with Ella’s permission form: it is due tomorrow at 9 AM. Then handle the electricity bill, due Thursday.\n\n${list(selected)}`;}
  else if(/prepare|pack|forget/.test(question)) {selected=radar.prepare;content=`A little preparation will make the week easier:\n\n${selected.map(i=>`• ${i.title}: ${i.prepare}`).join('\n\n')}`;}
  else if(/week|family|summary|hello|hi\b|need to deal/.test(question)) {selected=[...radar.attention,...data.filter(i=>radar.conflicts.some(c=>c.itemIds.includes(i.id)))];content=`This week is manageable. There are ${radar.attention.length} things that need attention and ${radar.conflicts.length} schedule conflict to sort out.\n\n${list(radar.attention)}\n\nWednesday’s dentist appointment and soccer practice overlap, with Jamie assigned to both. Ask Alex about covering the dentist.\n\nThe air filter and library books can wait.`;}
  else {content='I can help with this demo family’s week: deadlines, overlapping schedules, preparation, or what can wait. Try “What do I need to do tonight?” I only use the eight local sample notices, and I cannot send messages, make payments, or change bookings.';}
  return {content,sources:[...new Set(selected.map(i=>i.source))],suggestions};
 }
}
export const agent:AgentService=new MockAgentService();
