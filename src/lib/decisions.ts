import { items, type HouseholdItem } from './household';
export type HouseholdDecision = { id: string; completed?: boolean; resource?: 'Alex' | 'Jamie' };
export const decisionStorageKey = 'household-coo:demo-decisions:v1';

/** Only local completion and parent assignments may override the synthetic source data. */
export function validateDecisions(value: unknown): HouseholdDecision[] {
  if (!Array.isArray(value) || value.length > items.length) throw new Error('Invalid household decisions.');
  const ids = new Set<string>();
  return value.map((entry: unknown) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Invalid household decision.');
    const d = entry as Record<string, unknown>;
    const item = items.find(item => item.id === d.id);
    if (!item || ids.has(item.id) || Object.keys(d).some(key => !['id', 'completed', 'resource'].includes(key))) throw new Error('Invalid household decision.');
    if (d.completed !== undefined && typeof d.completed !== 'boolean') throw new Error('Invalid completion status.');
    if (d.resource !== undefined && (!item.resource || !['Alex', 'Jamie'].includes(d.resource as string))) throw new Error('Invalid parent assignment.');
    ids.add(item.id);
    return { id: item.id, ...(d.completed !== undefined ? { completed: d.completed as boolean } : {}), ...(d.resource !== undefined ? { resource: d.resource as 'Alex' | 'Jamie' } : {}) };
  });
}

export function decisionsFrom(data: HouseholdItem[]): HouseholdDecision[] {
  return data.flatMap(item => {
    const original = items.find(original => original.id === item.id);
    if (!original) return [];
    const completed = Boolean(item.completed);
    const changedParent = item.resource !== original.resource;
    return completed || changedParent ? [{ id: item.id, completed, ...(changedParent ? { resource: item.resource as 'Alex' | 'Jamie' } : {}) }] : [];
  });
}

export function applyDecisions(data: HouseholdItem[], decisions: HouseholdDecision[]): HouseholdItem[] {
  const result = data.map(item => {
    const d = decisions.find(d => d.id === item.id);
    return { ...item, ...d, detail: d?.resource && item.resource ? item.detail.replaceAll(item.resource, d.resource) : item.detail };
  });
  for (const item of result) {
    if (!item.resource || !item.start || !item.end) continue;
    const collision = result.find(other => other.id !== item.id && !other.completed && other.resource === item.resource && other.start && other.end && item.start! < other.end && other.start < item.end!);
    const alternate = item.resource === 'Jamie' ? 'Alex' : 'Jamie';
    item.reason = collision ? `${item.resource} is assigned to both ${item.title.toLowerCase()} and ${collision.title.toLowerCase()}, which overlap.` : `The current plan assigns ${item.resource} to this event, with no overlapping parent assignment.`;
    item.action = collision ? `Ask ${alternate} to cover ${item.title.toLowerCase()}, or arrange another ride.` : `Keep ${item.resource} on ${item.title.toLowerCase()} duty and confirm the plan with them.`;
  }
  return result;
}

export function inferAssignment(question: string): HouseholdDecision | null {
  const parent = question.match(/\b(alex|jamie)\s+(?:can|will|should|to)\s+(?:take|cover|handle|do|drive)\b/i)?.[1]
    ?? question.match(/\bassign\s+(alex|jamie)\b/i)?.[1];
  if (!parent || /\?|\b(?:could|would|if|not|don't|cannot|can't|why|what)\b/i.test(question)) return null;
  const resource = parent.toLowerCase() === 'alex' ? 'Alex' : 'Jamie';
  if (/\b(?:dentist|dental|noah)\b/i.test(question) && !/\b(?:soccer|ella)\b/i.test(question)) return { id: 'dentist', resource };
  if (/\b(?:soccer|ella)\b/i.test(question) && !/\b(?:dentist|dental|noah)\b/i.test(question)) return { id: 'soccer', resource };
  return null;
}
