export const CARD_DESIGNS = [
  { id: 'card-01', name: 'Cosmic Purple', image: require('../assets/Card Designs/card-01.png') },
  { id: 'card-02', name: 'Mystic Blue', image: require('../assets/Card Designs/card-02.png') },
  { id: 'card-03', name: 'Celestial Gold', image: require('../assets/Card Designs/card-03.png') },
  { id: 'card-04', name: 'Ethereal Pink', image: require('../assets/Card Designs/card-04.png') },
  { id: 'card-05', name: 'Starlight Teal', image: require('../assets/Card Designs/card-05.png') },
  { id: 'card-06', name: 'Lunar Silver', image: require('../assets/Card Designs/card-06.png') },
  { id: 'card-07', name: 'Aurora Green', image: require('../assets/Card Designs/card-07.png') },
  { id: 'card-08', name: 'Nebula Violet', image: require('../assets/Card Designs/card-08.png') },
  { id: 'card-09', name: 'Solar Orange', image: require('../assets/Card Designs/card-09.png') },
  { id: 'card-10', name: 'Galaxy Indigo', image: require('../assets/Card Designs/card-10.png') },
  { id: 'card-11', name: 'Twilight Magenta', image: require('../assets/Card Designs/card-11.png') },
  { id: 'card-12', name: 'Astral Cyan', image: require('../assets/Card Designs/card-12.png') },
];

export function getCardDesign(id: string | undefined) {
  if (!id) return null;
  return CARD_DESIGNS.find(d => d.id === id) || null;
}
