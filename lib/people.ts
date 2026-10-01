export interface Person {
  id: PersonId;
  label: string;
  color: string;
}

export type PersonId = 'person1' | 'person2';

/**
 * The two people sharing this tracker. Rename the labels (and tweak the
 * colors if you like) to make the app yours.
 */
export const PEOPLE: Record<PersonId, Person> = {
  person1: { id: 'person1', label: 'Person 1', color: '#E67E22' },
  person2: { id: 'person2', label: 'Person 2', color: '#16A085' },
};

export const PERSON_IDS = Object.keys(PEOPLE) as PersonId[];

export function personLabel(id: string): string {
  return PEOPLE[id as PersonId]?.label ?? id;
}

export function personColor(id: string): string {
  return PEOPLE[id as PersonId]?.color ?? '#7F8C8D';
}

export const OVERLAP_COLOR = '#E74C3C';
