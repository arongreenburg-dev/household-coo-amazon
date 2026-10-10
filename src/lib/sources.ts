import { items, type HouseholdItem } from './household';
export type SourceDocument = {id:string; channel:'Email'|'Calendar'|'Document'; title:string; sender:string; received:string; body:string};
export const demoSources:SourceDocument[] = [
 {id:'school-form',channel:'Email',title:'Action needed: science museum permission slip',sender:'Ms. Patel · Oakwood Elementary',received:'May 18, 8:10 AM',body:'Hi families! Our class visits the science museum on Friday, May 22. Please return Ella’s signed permission slip and $15 by Tuesday, May 19 at 9 AM. Students without a signed form cannot attend. Thank you!'},
 {id:'dental-notice',channel:'Email',title:'Noah’s appointment confirmation',sender:'Maple Dental',received:'May 17, 2:30 PM',body:'Noah Morgan is scheduled for Wednesday, May 20, 3:30–4:15 PM. Please arrive 10 minutes early and bring your insurance card. Your booking lists Jamie Morgan as the accompanying parent.'},
 {id:'soccer-calendar',channel:'Calendar',title:'Ella · soccer practice',sender:'Family shared calendar',received:'Updated May 16',body:'Wednesday, May 20 · 4:00–5:00 PM\nLocation: Riverside Park\nAssigned parent: Jamie\nBring cleats, shin guards, and a full water bottle.'},
 {id:'energy-bill',channel:'Document',title:'May electricity statement',sender:'City Energy · demo Drive folder',received:'May 15',body:'Account: Morgan household\nAmount due: $128.40\nPayment deadline: Thursday, May 21\nAuto-pay: OFF for this billing cycle\nPay manually by the due date to avoid a late fee. Household owner: Alex.'},
 {id:'field-trip-calendar',channel:'Calendar',title:'Ella · science museum trip',sender:'Oakwood school calendar',received:'Updated May 17',body:'Friday, May 22 · 8:30 AM–2:30 PM\nBus departs from school. Students should arrive by 8:15 AM. Lunch is not provided. Pack a labeled nut-free lunch, water bottle, and light jacket.'},
 {id:'party-invite',channel:'Email',title:'Noah is invited to Mia’s birthday!',sender:'Mia’s family',received:'May 16, 11:05 AM',body:'We would love Noah to join Mia’s birthday on Saturday, May 23 at 2 PM. Please RSVP by Thursday, May 21 at 6 PM so we can plan food. A small gift is optional.'},
 {id:'home-checklist',channel:'Document',title:'Home maintenance checklist',sender:'Morgan household · demo Drive folder',received:'Updated May 14',body:'Alex: replace the air filter by Saturday, May 30. The current filter is still usable and within its service window; this can wait until next weekend.'},
 {id:'library-reminder',channel:'Email',title:'Your library loans',sender:'Public library',received:'May 18, 7:00 AM',body:'Ella and Noah have four books due Wednesday, May 27 at 6 PM. No renewals are needed yet. Please gather the books over the weekend for return next week.'},
 {id:'newsletter',channel:'Email',title:'Oakwood weekly newsletter',sender:'Oakwood Elementary office',received:'May 18, 7:45 AM',body:'Congratulations to our art fair participants! Photos are available in the school gallery. This is an informational update; there are no forms, payments, or new deadlines.'},
 {id:'receipt',channel:'Email',title:'Your grocery order receipt',sender:'Neighborhood Grocery',received:'May 17, 5:20 PM',body:'Thanks for shopping with us. Your order was delivered yesterday and paid in full. No further action is required.'}
];
// Demo extraction fixtures intentionally make the scan reproducible. This is not NLP.
// A real Extractor must infer obligations from SourceDocument.body and preserve provenance.
const fixtureExtractions:Record<string,string[]>={'school-form':['permission'],'dental-notice':['dentist'],'soccer-calendar':['soccer'],'energy-bill':['bill'],'field-trip-calendar':['museum'],'party-invite':['birthday'],'home-checklist':['filter'],'library-reminder':['library'],'newsletter':[],'receipt':[]};
export interface SourceConnector {listDocuments():Promise<SourceDocument[]>}
export interface ObligationExtractor {extract(document:SourceDocument):Promise<HouseholdItem[]>;extractDocuments?(documents:SourceDocument[]):Promise<{sourceId:string;items:HouseholdItem[]}[]>}
export class DemoSourceConnector implements SourceConnector {async listDocuments(){return demoSources;}}
export class MockObligationExtractor implements ObligationExtractor {async extract(document:SourceDocument){return (fixtureExtractions[document.id]??[]).map(id=>({...items.find(i=>i.id===id)!}));}}
export function extractedItemsFor(source:SourceDocument){return (fixtureExtractions[source.id]??[]).map(id=>items.find(i=>i.id===id)!);}
export async function scanSources(connector:SourceConnector=new DemoSourceConnector(),extractor:ObligationExtractor=new MockObligationExtractor()) {
 const documents=await connector.listDocuments();const extracted=extractor.extractDocuments?await extractor.extractDocuments(documents):await Promise.all(documents.map(async document=>({sourceId:document.id,items:await extractor.extract(document)})));
 return {items:extracted.flatMap(result=>result.items),documentsScanned:documents.length,informational:extracted.filter(result=>!result.items.length).length,provenance:extracted.map(result=>({sourceId:result.sourceId,itemIds:result.items.map(item=>item.id)}))};
}
