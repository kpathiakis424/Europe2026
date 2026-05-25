export type Phase = "together" | "friends";
export type CityStatus = "confirmed" | "idea";

export interface Activity {
  id: string;
  title: string;
  category: string;
  notes: string;
  votes: string[]; // traveler ids
}

export interface City {
  id: string;
  name: string;
  country: string;
  phase: Phase;
  status: CityStatus;
  nights: number | null;
  notes: string;
  votes: string[]; // interest votes (mostly for "idea" cities)
  activities: Activity[];
}

export interface Traveler {
  id: string;
  name: string;
  color: string;
}

export interface Trip {
  version: number;
  title: string;
  dates: string; // free text, e.g. "Aug 2026" — kept loose on purpose
  travelers: Traveler[];
  cities: City[];
}
