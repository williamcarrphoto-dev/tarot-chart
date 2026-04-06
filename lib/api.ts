import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoonPhase, PlanetaryEvent, DayAstroData } from '../types';

const CACHE_PREFIX = '@aylas_tarot:astro_cache:';

// ---------------------------------------------------------------------------
// Moon phase data via Farmsense API (no key required)
// ---------------------------------------------------------------------------

function moonPhaseEmoji(phase: string): string {
  const p = phase.toLowerCase();
  if (p.includes('new')) return '🌑';
  if (p.includes('waxing crescent')) return '🌒';
  if (p.includes('first quarter')) return '🌓';
  if (p.includes('waxing gibbous')) return '🌔';
  if (p.includes('full')) return '🌕';
  if (p.includes('waning gibbous')) return '🌖';
  if (p.includes('last quarter') || p.includes('third quarter')) return '🌗';
  if (p.includes('waning crescent')) return '🌘';
  return '🌙';
}

export async function fetchMoonPhase(date: string): Promise<MoonPhase | null> {
  const cacheKey = `${CACHE_PREFIX}moon:${date}`;
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached) as MoonPhase;

    const d = new Date(date);
    const unixTs = Math.floor(d.getTime() / 1000);
    const res = await fetch(
      `https://api.farmsense.net/v1/moonphases/?d=${unixTs}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const entry = data[0];
    const phase: MoonPhase = {
      date,
      phase: entry.Phase ?? 'Unknown',
      illumination: parseFloat(entry.Illumination ?? '0'),
      emoji: moonPhaseEmoji(entry.Phase ?? ''),
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(phase));
    return phase;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Curated static planetary events for 2025-2026
// (Replaces AstronomyAPI.com free tier which is very rate-limited)
// This list can be expanded or replaced with a live API later.
// ---------------------------------------------------------------------------

import { ZodiacSign } from '../types';

const STATIC_EVENTS: PlanetaryEvent[] = [
  // 2026
  {
    date: '2026-01-03',
    title: 'Full Moon in Cancer',
    description: 'Heightened emotions and a focus on home and family.',
    affectedSigns: ['Cancer', 'Capricorn', 'Aries', 'Libra'],
    type: 'other',
  },
  {
    date: '2026-01-17',
    title: 'New Moon in Capricorn',
    description: 'Set intentions around career, ambition, and long-term goals.',
    affectedSigns: ['Capricorn', 'Cancer', 'Taurus', 'Virgo'],
    type: 'other',
  },
  {
    date: '2026-02-01',
    title: 'Full Moon in Leo',
    description: 'A bold, creative full moon calling for self-expression.',
    affectedSigns: ['Leo', 'Aquarius', 'Aries', 'Sagittarius'],
    type: 'other',
  },
  {
    date: '2026-02-16',
    title: 'New Moon in Aquarius',
    description: 'Ideal for innovation, community, and future-focused intentions.',
    affectedSigns: ['Aquarius', 'Leo', 'Gemini', 'Libra'],
    type: 'other',
  },
  {
    date: '2026-03-02',
    title: 'Full Moon in Virgo',
    description: 'Focus on health, routines, and practical matters.',
    affectedSigns: ['Virgo', 'Pisces', 'Gemini', 'Sagittarius'],
    type: 'other',
  },
  {
    date: '2026-03-09',
    title: 'Mercury Retrograde begins in Aries',
    description: 'Review, revise, and avoid signing contracts until Apr 2.',
    affectedSigns: ['Aries', 'Gemini', 'Virgo', 'Libra'],
    type: 'retrograde',
  },
  {
    date: '2026-03-18',
    title: 'New Moon in Pisces — Solar Eclipse',
    description: 'A powerful eclipse opening new spiritual and creative chapters.',
    affectedSigns: ['Pisces', 'Virgo', 'Scorpio', 'Cancer'],
    type: 'eclipse',
  },
  {
    date: '2026-03-20',
    title: 'Sun enters Aries (Spring Equinox)',
    description: 'The astrological new year begins. Energy, initiative, and new starts.',
    affectedSigns: ['Aries', 'Leo', 'Sagittarius'],
    type: 'ingress',
  },
  {
    date: '2026-04-02',
    title: 'Mercury Direct in Aries',
    description: 'Mercury stations direct — communication and travel clear up.',
    affectedSigns: ['Aries', 'Gemini', 'Virgo'],
    type: 'direct',
  },
  {
    date: '2026-04-01',
    title: 'Full Moon in Libra — Lunar Eclipse',
    description: 'Relationship dynamics and balance come to a head under this eclipse.',
    affectedSigns: ['Libra', 'Aries', 'Cancer', 'Capricorn'],
    type: 'eclipse',
  },
  {
    date: '2026-04-19',
    title: 'Sun enters Taurus',
    description: 'Season of sensuality, stability, and earthly pleasures.',
    affectedSigns: ['Taurus', 'Virgo', 'Capricorn'],
    type: 'ingress',
  },
  {
    date: '2026-04-30',
    title: 'New Moon in Taurus',
    description: 'Plant seeds around money, self-worth, and material security.',
    affectedSigns: ['Taurus', 'Scorpio', 'Capricorn', 'Virgo'],
    type: 'other',
  },
  {
    date: '2026-05-15',
    title: 'Venus enters Cancer',
    description: 'Love and nurturing take centre stage; home life is highlighted.',
    affectedSigns: ['Cancer', 'Scorpio', 'Pisces', 'Taurus'],
    type: 'ingress',
  },
  {
    date: '2026-05-21',
    title: 'Sun enters Gemini',
    description: 'Curiosity, communication, and social connections flourish.',
    affectedSigns: ['Gemini', 'Aquarius', 'Libra'],
    type: 'ingress',
  },
  {
    date: '2026-06-06',
    title: 'Jupiter enters Cancer',
    description: 'Luck and expansion in home, family, and emotional security for a year.',
    affectedSigns: ['Cancer', 'Scorpio', 'Pisces', 'Taurus'],
    type: 'ingress',
  },
  {
    date: '2026-06-21',
    title: 'Sun enters Cancer (Summer Solstice)',
    description: 'The longest day; turn inward, nurture what matters most.',
    affectedSigns: ['Cancer', 'Scorpio', 'Pisces'],
    type: 'ingress',
  },
  {
    date: '2026-07-23',
    title: 'Sun enters Leo',
    description: 'Bold self-expression, creativity, and joy take the spotlight.',
    affectedSigns: ['Leo', 'Aries', 'Sagittarius'],
    type: 'ingress',
  },
  {
    date: '2026-07-29',
    title: 'Mercury Retrograde begins in Leo',
    description: 'Review creative projects and personal communications carefully.',
    affectedSigns: ['Leo', 'Gemini', 'Virgo'],
    type: 'retrograde',
  },
  {
    date: '2026-08-22',
    title: 'Mercury Direct in Leo',
    description: 'Expression and clarity return after retrograde.',
    affectedSigns: ['Leo', 'Gemini', 'Virgo'],
    type: 'direct',
  },
  {
    date: '2026-08-23',
    title: 'Sun enters Virgo',
    description: 'Focus shifts to health, organisation, and practical improvement.',
    affectedSigns: ['Virgo', 'Taurus', 'Capricorn'],
    type: 'ingress',
  },
  {
    date: '2026-09-22',
    title: 'Sun enters Libra (Autumn Equinox)',
    description: 'Balance, harmony, and relationships come into focus.',
    affectedSigns: ['Libra', 'Gemini', 'Aquarius'],
    type: 'ingress',
  },
  {
    date: '2026-10-23',
    title: 'Sun enters Scorpio',
    description: 'Deep transformation, intensity, and uncovering hidden truths.',
    affectedSigns: ['Scorpio', 'Cancer', 'Pisces'],
    type: 'ingress',
  },
  {
    date: '2026-11-08',
    title: 'Saturn Direct in Pisces',
    description: 'Structure and responsibility restore flow to spiritual and artistic work.',
    affectedSigns: ['Pisces', 'Virgo', 'Capricorn', 'Cancer'],
    type: 'direct',
  },
  {
    date: '2026-11-22',
    title: 'Sun enters Sagittarius',
    description: 'Optimism, adventure, and philosophical expansion.',
    affectedSigns: ['Sagittarius', 'Aries', 'Leo'],
    type: 'ingress',
  },
  {
    date: '2026-12-21',
    title: 'Sun enters Capricorn (Winter Solstice)',
    description: 'The shortest day; ambition and structure guide the season.',
    affectedSigns: ['Capricorn', 'Taurus', 'Virgo'],
    type: 'ingress',
  },
];

export async function fetchAstroEventsForMonth(
  year: number,
  month: number
): Promise<PlanetaryEvent[]> {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return STATIC_EVENTS.filter((e) => e.date.startsWith(prefix));
}

export async function fetchDayAstroData(date: string): Promise<DayAstroData> {
  const [year, mon] = date.split('-').map(Number);
  const [moonPhase, allMonthEvents] = await Promise.all([
    fetchMoonPhase(date),
    fetchAstroEventsForMonth(year, mon),
  ]);
  const events = allMonthEvents.filter((e) => e.date === date);
  return { date, moonPhase: moonPhase ?? undefined, events };
}

export function getFriendImpactReasons(
  affectedSigns: ZodiacSign[],
  friendSigns: (ZodiacSign | '')[]
): string[] {
  return affectedSigns
    .filter((s): s is ZodiacSign => friendSigns.includes(s))
    .map((s) => s);
}
