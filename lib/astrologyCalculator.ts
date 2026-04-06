import { ZodiacSign } from '../types';
import { getSunSign } from './astrology';

// Convert ecliptic longitude to zodiac sign
function longitudeToSign(longitude: number): ZodiacSign | '' {
  // Normalize to 0-360
  longitude = ((longitude % 360) + 360) % 360;
  
  const signs: ZodiacSign[] = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex] || '';
}

// Calculate Julian Day Number
function toJulianDay(year: number, month: number, day: number, hour: number, minute: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const jd = jdn + (hour - 12) / 24 + minute / 1440;
  
  return jd;
}

// Calculate moon position (simplified)
function calculateMoonPosition(jd: number): number {
  // Simplified moon longitude calculation
  const T = (jd - 2451545.0) / 36525;
  const L0 = 218.3164477 + 481267.88123421 * T;
  return (L0 % 360 + 360) % 360;
}

// Calculate ascendant (rising sign)
function calculateAscendant(jd: number, lat: number, lng: number): number {
  const T = (jd - 2451545.0) / 36525;
  
  // Mean obliquity of ecliptic
  const epsilon = 23.439291 - 0.0130042 * T;
  const epsilonRad = epsilon * Math.PI / 180;
  
  // Greenwich Mean Sidereal Time
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0);
  
  // Local Sidereal Time
  const lst = (gmst + lng) % 360;
  const lstRad = lst * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  
  // Calculate ascendant
  const y = -Math.cos(lstRad);
  const x = Math.sin(lstRad) * Math.cos(epsilonRad) + Math.tan(latRad) * Math.sin(epsilonRad);
  
  let asc = Math.atan2(y, x) * 180 / Math.PI;
  asc = (asc + 360) % 360;
  
  return asc;
}

interface BirthData {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string; // City name or "lat,lng"
}

interface CalculatedSigns {
  sun: ZodiacSign | '';
  moon: ZodiacSign | '';
  rising: ZodiacSign | '';
}

/**
 * Calculate sun, moon, and rising signs from birth data
 * Requires: date (YYYY-MM-DD), time (HH:MM), and location coordinates
 */
export async function calculateAstrologicalSigns(birthData: BirthData): Promise<CalculatedSigns> {
  try {
    const { date, time, location } = birthData;
    
    if (!date || !time || !location) {
      return { sun: '', moon: '', rising: '' };
    }

    // Parse date and time
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    // Get coordinates from location
    const coords = await getCoordinates(location);
    if (!coords) {
      console.log('⚠️ Cannot calculate moon/rising signs - failed to get coordinates for:', location);
      console.log('💡 Try entering location as: "City, Country" or "latitude,longitude"');
      return { sun: getSunSign(date), moon: '', rising: '' };
    }

    // Create Julian Date
    const jd = toJulianDay(year, month, day, hour, minute);

    // Calculate Sun sign (use existing function)
    const sunSign = getSunSign(date);

    // Calculate Moon position
    const moonLongitude = calculateMoonPosition(jd);
    const moonSign = longitudeToSign(moonLongitude);

    // Calculate Rising Sign (Ascendant)
    const ascendantLongitude = calculateAscendant(jd, coords.lat, coords.lng);
    const risingSign = longitudeToSign(ascendantLongitude);

    return {
      sun: sunSign,
      moon: moonSign,
      rising: risingSign,
    };
  } catch (error) {
    console.error('Error calculating astrological signs:', error);
    // Fallback to at least sun sign
    return { 
      sun: getSunSign(birthData.date), 
      moon: '', 
      rising: '' 
    };
  }
}

// Common city coordinates for fallback when geocoding fails
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Australian cities
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'melbourne': { lat: -37.8136, lng: 144.9631 },
  'brisbane': { lat: -27.4698, lng: 153.0251 },
  'perth': { lat: -31.9505, lng: 115.8605 },
  'adelaide': { lat: -34.9285, lng: 138.6007 },
  'canberra': { lat: -35.2809, lng: 149.1300 },
  // Major world cities
  'london': { lat: 51.5074, lng: -0.1278 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'paris': { lat: 48.8566, lng: 2.3522 },
};

/**
 * Get coordinates from location string
 * Supports: "lat,lng" format, city name lookup, or geocoding
 */
async function getCoordinates(location: string): Promise<{ lat: number; lng: number } | null> {
  console.log('🌍 Getting coordinates for:', location);
  
  // Check if already in lat,lng format
  if (location.includes(',')) {
    const parts = location.split(',');
    if (parts.length === 2) {
      const [lat, lng] = parts.map(s => parseFloat(s.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log('✓ Using provided coordinates:', { lat, lng });
        return { lat, lng };
      }
    }
  }

  // Check common cities database first
  const locationLower = location.toLowerCase().trim();
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (locationLower.includes(city)) {
      console.log('✓ Found in city database:', city, coords);
      return coords;
    }
  }

  // Try to geocode city name using free Nominatim API (may fail due to CORS in browser)
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    console.log('🔍 Trying geocoding API:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AylasTarotApp/1.0',
      },
    });
    const data = await response.json();
    
    if (data && data.length > 0) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      console.log('✓ Geocoded coordinates:', coords, 'for:', data[0].display_name);
      return coords;
    }
  } catch (error) {
    console.log('⚠️ Geocoding API unavailable (CORS or network issue)');
  }

  console.log('❌ Could not find coordinates for:', location);
  console.log('💡 Supported cities:', Object.keys(CITY_COORDINATES).join(', '));
  console.log('💡 Or enter as: "latitude,longitude" (e.g. "-37.8136,144.9631")');
  return null;
}

/**
 * Validate if we have enough data to calculate signs
 */
export function canCalculateSigns(date?: string, time?: string, location?: string): boolean {
  return !!(date && time && location);
}
