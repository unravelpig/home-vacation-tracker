export type TripType = 'adventure' | 'relax' | 'cultural' | 'gastronomic' | 'beach' | 'mountain' | 'city' | 'other';
export type PlanStatus = 'planned' | 'reserved' | 'completed';
export type WorkPerson = 'person1' | 'person2';

export interface Idea {
  id: string;
  title: string;
  description: string | null;
  countries: string[];
  cities: string[];
  estimated_start_date: string | null;
  estimated_end_date: string | null;
  trip_type: TripType | null;
  estimated_budget: number | null;
  duration_days: number | null;
  season: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  idea_id: string | null;
  title: string;
  description: string | null;
  countries: string[];
  cities: string[];
  start_date: string;
  end_date: string;
  trip_type: TripType | null;
  estimated_budget: number | null;
  status: PlanStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  idea?: Idea;
}

export interface WorkVacation {
  id: string;
  person: WorkPerson;
  start_date: string;
  end_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
