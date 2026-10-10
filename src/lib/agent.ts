import { items, type HouseholdItem } from './household';
import { applyDecisions, inferAssignment, type HouseholdDecision } from './decisions';
import { analyzeHousehold, tonightActions } from './reasoning';
export type Message = {role:'user'|'assistant';content:string};
export type AgentReply = {content:string; sources:string[]; suggestions:string[]; decisions?:HouseholdDecision[]};
// Implement this interface to connect a provider. Keep credentials and provider calls server-side.
export interface AgentService {reply(messages:Message[],data?:HouseholdItem[]):Promise<AgentReply>}
const suggestions=['What is most urgent?','What can wait?','What conflicts do we have?','What do I need to do tonight?'];
export class MockAgentService implements AgentService {
 async reply(messages:Message[],data:HouseholdItem[]=items):Promise<AgentReply> {
  const question=messages.at(-1)?.content.toLowerCase()??'';
  const proposed=inferAssignment(question);
  const assignment=proposed&&data.some(i=>i.id===proposed.id&&i.resource)?proposed:null;
  if(assignment)data=applyDecisions(data,[assignment]);
  const radar=analyzeHousehold(data);
  let selected:HouseholdItem[]=[]; let content='';
  const list=(rows:HouseholdItem[])=>rows.map(i=>`• ${i.action}`).join('\n\n');
  if(assignment){selected=data.filter(i=>i.id===assignment.id);content=`Saved in your demo plan: ${assignment.resource} is assigned to ${selected[0].title.toLowerCase()}. ${radar.conflicts.length?'There is still an overlapping parent assignment to sort out.':'There are no overlapping parent assignments now.'}\n\nThis updates the local household plan only. No calendar booking was changed and no message was sent.`;}
  else if(/why|important|explain/.test(question)) {
   const previous=[...messages.slice(0,-1)].reverse().find(m=>m.role==='assistant')?.content.toLowerCase()??'';
   selected=data.filter(i=>question.includes(i.id)||question.includes(i.title.toLowerCase())||(/electric|bill/.test(question)&&i.id==='bill')||(/form|field trip/.test(question)&&i.id==='permission')||(/dentist/.test(question)&&i.id==='dentist'));
   if(!selected.length) selected=data.filter(i=>previous.includes(i.action.toLowerCase())||previous.includes(i.title.toLowerCase()));
   if(!selected.length) selected=radar.attention.slice(0,1);
   if(!selected.length)content='There are no urgent items left to explain. Ask about a specific event or source notice.';
   if(selected.length)content=selected.map(i=>`${i.title}: ${i.reason}\n\nNext step: ${i.action}`).join('\n\n');
  } else if(/wait|later|defer/.test(question)) {selected=radar.wait;content=`These can wait until next week. Clear the time-sensitive items first.\n\n${list(selected)}`;}
  else if(/conflict|overlap|clash/.test(question)) {selected=data.filter(i=>radar.conflicts.some(c=>c.itemIds.includes(i.id)));content=radar.conflicts.length?radar.conflicts.map(c=>`${c.title}\n${c.detail}\n\nSuggested plan: ${c.action}`).join('\n\n'):'There are no overlapping assignments in the demo schedule.';}
  else if(/tonight|today|evening/.test(question)) {selected=tonightActions(data);content=selected.length?`A manageable plan for tonight:\n\n${list(selected)}\n\nThis reflects the remaining tasks and your current parent assignments.`:'Tonight’s priority tasks are already complete in your demo plan.';}
  else if(/urgent|priority|first/.test(question)) {selected=radar.attention;content=selected.length?`Start with ${selected[0].title.toLowerCase()}: it is due ${selected[0].id==='permission'?'tomorrow at 9 AM':'Thursday'}.\n\n${list(selected)}`:'You have no urgent tasks left in this demo week. Check Coming Up for the remaining events.';}
  else if(/prepare|pack|forget/.test(question)) {selected=radar.prepare;content=`A little preparation will make the week easier:\n\n${selected.map(i=>`• ${i.title}: ${i.prepare}`).join('\n\n')}`;}
  else if(/week|family|summary|hello|hi\b|need to deal/.test(question)) {selected=[...radar.attention,...data.filter(i=>radar.conflicts.some(c=>c.itemIds.includes(i.id)))];content=`This week is manageable. There are ${radar.attention.length} things that need attention and ${radar.conflicts.length} schedule conflict to sort out.\n\n${list(radar.attention)}\n\n${radar.conflicts.length?radar.conflicts.map(c=>c.detail+' '+c.action).join(' '):'Your current parent assignments have no schedule conflicts.'}\n\nThe air filter and library books can wait.`;}
  else {content='I can help with this demo family’s week: deadlines, overlapping schedules, preparation, or what can wait. Try “What do I need to do tonight?” I only use the eight local sample notices, and I cannot send messages, make payments, or change bookings.';}
  return {content,sources:[...new Set(selected.map(i=>i.source))],suggestions,...(assignment?{decisions:[{...assignment,completed:selected[0].completed??false}]}:{})};
 }
}
export const agent:AgentService=new MockAgentService();
