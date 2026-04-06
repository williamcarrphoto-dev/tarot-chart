export const CARD_DESIGNS = [
  { id: 'aries', name: 'Aries', image: require('../assets/Card Designs/Aries.png') },
  { id: 'taurus', name: 'Taurus', image: require('../assets/Card Designs/Taurus.png') },
  { id: 'gemini', name: 'Gemini', image: require('../assets/Card Designs/Gemini.png') },
  { id: 'cancer', name: 'Cancer', image: require('../assets/Card Designs/Cancer.png') },
  { id: 'leo', name: 'Leo', image: require('../assets/Card Designs/Leo.png') },
  { id: 'virgo', name: 'Virgo', image: require('../assets/Card Designs/Virgo.png') },
  { id: 'libra', name: 'Libra', image: require('../assets/Card Designs/Libra.png') },
  { id: 'scorpio', name: 'Scorpio', image: require('../assets/Card Designs/Scorpio.png') },
  { id: 'sagittarius', name: 'Sagittarius', image: require('../assets/Card Designs/Sagittarius.png') },
  { id: 'capricorn', name: 'Capricorn', image: require('../assets/Card Designs/Capricorn.png') },
  { id: 'aquarius', name: 'Aquarius', image: require('../assets/Card Designs/Aquarius.png') },
  { id: 'pisces', name: 'Pisces', image: require('../assets/Card Designs/Pisces.png') },
];

// Default card design for all users (Aries as first sign)
export const DEFAULT_CARD_DESIGN = 'aries';

export function getCardDesign(id: string | undefined) {
  // Use default if no ID provided
  const designId = id || DEFAULT_CARD_DESIGN;
  return CARD_DESIGNS.find(d => d.id === designId) || CARD_DESIGNS[0];
}
