// Deterministic daily horoscope generator based on signs + date
// Changes daily, consistent for the same person on the same day

const THEMES = [
  'love', 'career', 'growth', 'intuition', 'energy',
  'creativity', 'wisdom', 'connection', 'transformation', 'abundance',
];

const OPENINGS: Record<string, string[]> = {
  Aries: [
    'Your fiery spirit blazes bright today.',
    'Bold moves are favored now.',
    'Channel your inner warrior.',
    'Your courage opens new doors.',
  ],
  Taurus: [
    'Steady progress brings rewards.',
    'Ground yourself in what matters.',
    'Luxury and comfort call to you.',
    'Your patience becomes your power.',
  ],
  Gemini: [
    'Communication is your superpower today.',
    'Curious energy surrounds you.',
    'A new perspective shifts everything.',
    'Your words carry extra magic.',
  ],
  Cancer: [
    'Trust your emotional instincts.',
    'Home and heart align beautifully.',
    'Your nurturing energy heals others.',
    'Deep feelings guide you true.',
  ],
  Leo: [
    'Your radiance draws others in.',
    'Step into the spotlight today.',
    'Creative fire burns within you.',
    'Your generosity returns tenfold.',
  ],
  Virgo: [
    'Details reveal hidden treasures.',
    'Your analytical mind shines.',
    'Organization brings clarity.',
    'Service to others lifts your spirit.',
  ],
  Libra: [
    'Balance brings inner peace.',
    'Harmony flows through your day.',
    'Beauty surrounds you everywhere.',
    'Partnerships flourish now.',
  ],
  Scorpio: [
    'Deep truths surface today.',
    'Your intensity fuels transformation.',
    'Trust the process of change.',
    'Hidden strengths emerge.',
  ],
  Sagittarius: [
    'Adventure beckons on the horizon.',
    'Expand your worldview today.',
    'Optimism opens unexpected doors.',
    'Your philosophical side deepens.',
  ],
  Capricorn: [
    'Ambition meets opportunity.',
    'Your discipline pays dividends.',
    'Structure creates freedom.',
    'Leadership comes naturally today.',
  ],
  Aquarius: [
    'Innovation sparks breakthrough ideas.',
    'Your uniqueness is your gift.',
    'Community connections strengthen.',
    'Think beyond the ordinary.',
  ],
  Pisces: [
    'Dreams carry important messages.',
    'Your intuition is razor-sharp.',
    'Creative visions flow freely.',
    'Compassion opens sacred doors.',
  ],
};

const MOON_INFLUENCES = [
  'Your emotional depth adds richness to every encounter.',
  'Inner feelings guide you toward the right choice.',
  'Emotional wisdom lights the path forward.',
  'Trust the tides of your inner world.',
  'Your sensitivity is a source of great strength.',
  'Emotional currents carry you toward healing.',
  'The heart knows what the mind cannot see.',
  'Nurture yourself as you nurture others.',
];

const RISING_ENERGIES = [
  'Others see your strength shining through.',
  'First impressions work powerfully in your favor.',
  'Your presence commands attention effortlessly.',
  'The world responds to your authentic self.',
  'Your outer glow matches your inner light.',
  'New beginnings align with your true nature.',
  'Your aura radiates confidence and warmth.',
  'Step forward — the universe has your back.',
];

// Simple hash to get deterministic but varied results
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function getDailyHoroscope(
  sunSign: string,
  moonSign: string,
  risingSign: string,
): string {
  if (!sunSign) return '';

  const today = new Date();
  const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const seed = hashCode(`${dateKey}-${sunSign}-${moonSign}-${risingSign}`);

  // Pick opening based on sun sign
  const sunOpenings = OPENINGS[sunSign] || OPENINGS['Aries'];
  const opening = sunOpenings[seed % sunOpenings.length];

  // Pick moon influence
  const moonLine = moonSign
    ? MOON_INFLUENCES[(seed >> 3) % MOON_INFLUENCES.length]
    : '';

  // Pick rising energy
  const risingLine = risingSign
    ? RISING_ENERGIES[(seed >> 6) % RISING_ENERGIES.length]
    : '';

  // Combine into a brief horoscope
  const parts = [opening, moonLine, risingLine].filter(Boolean);
  return parts.join(' ');
}
