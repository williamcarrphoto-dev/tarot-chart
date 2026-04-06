export const CARD_DESIGNS = [
  { id: 'card-01', name: 'Cosmic Purple', image: require('../assets/Card Designs/card-01.png') },
];

// Default card design for all users
export const DEFAULT_CARD_DESIGN = 'card-01';

export function getCardDesign(id: string | undefined) {
  // Use default if no ID provided
  const designId = id || DEFAULT_CARD_DESIGN;
  return CARD_DESIGNS.find(d => d.id === designId) || CARD_DESIGNS[0];
}
