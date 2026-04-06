export type ZodiacSign =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export interface Friend {
  id: string;
  name: string;
  birthDate: string;       // ISO date string: YYYY-MM-DD
  birthTime: string;       // HH:MM (24h)
  birthLocation: string;   // e.g. "London, UK"
  sunSign: ZodiacSign | '';
  moonSign: ZodiacSign | '';
  risingSign: ZodiacSign | '';
  notes?: string;
  createdAt: string;       // ISO datetime
  cardDesign?: string;     // Card design ID
}

export interface MoonPhase {
  date: string;            // YYYY-MM-DD
  phase: string;           // e.g. "Full Moon", "New Moon", "Waxing Crescent"
  illumination: number;    // 0–1
  emoji: string;
}

export interface PlanetaryEvent {
  date: string;            // YYYY-MM-DD
  title: string;           // e.g. "Mercury enters Aries"
  description: string;
  affectedSigns: ZodiacSign[];
  type: 'ingress' | 'retrograde' | 'direct' | 'eclipse' | 'conjunction' | 'other';
}

export interface DayAstroData {
  date: string;
  moonPhase?: MoonPhase;
  events: PlanetaryEvent[];
}

export interface FriendImpact {
  friend: Friend;
  relevance: 'high' | 'medium' | 'low';
  reason: string;
}
