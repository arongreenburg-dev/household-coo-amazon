import { demoNow, items, type HouseholdItem } from './household';
export type Conflict = {id:string; title:string; detail:string; action:string; itemIds:string[]};
export function analyzeHousehold(data:HouseholdItem[]=items, now:Date=demoNow) {
 const active=data.filter(i=>!i.completed).sort((a,b)=>a.due.localeCompare(b.due));
 const weekEnd=new Date(now); weekEnd.setDate(now.getDate()+6); weekEnd.setHours(23,59,59,999);
 const thisWeek=active.filter(i=>new Date(i.due)<=weekEnd);
 const conflicts:Conflict[]=[];
 for(let a=0;a<active.length;a++) for(let b=a+1;b<active.length;b++) {
  const x=active[a],y=active[b];
  if(x.resource && x.resource===y.resource && x.start && x.end && y.start && y.end && x.start<y.end && y.start<x.end)
   conflicts.push({id:`${x.id}-${y.id}`,title:'One parent, two places',detail:`${x.title} and ${y.title} overlap. ${x.resource} is assigned to both.`,action:`Ask ${x.resource==='Jamie'?'Alex':'Jamie'} to cover ${x.title.toLowerCase()} while ${x.resource} handles ${y.title.toLowerCase()}. Confirm availability first.`,itemIds:[x.id,y.id]});
 }
 return {attention:thisWeek.filter(i=>i.priority==='high'),upcoming:thisWeek.filter(i=>i.priority!=='high'),conflicts,prepare:thisWeek.filter(i=>i.prepare),wait:active.filter(i=>new Date(i.due)>weekEnd),all:active};
}
export function tonightActions(data:HouseholdItem[]=items) {return analyzeHousehold(data).all.filter(i=>i.id==='permission'||i.id==='bill'||i.id==='dentist');}
