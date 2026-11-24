// Pure helpers for Find Experiences (tested in tests/).
export const MAX_CITY = 60;
export function cleanCity(raw) {
  if (typeof raw !== 'string') return '';
  return raw.normalize('NFC')
    .replace(/[\u0000-\u001F\u007F<>{}[\]\\"`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CITY);
}
export const isValidCity = c => c.length >= 2 && /\p{L}/u.test(c);
const norm = s => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/^new /, '');
export function matchPlaces(places, city, skill) {
  const c = norm(city);
  const inCity = places.filter(p => norm(p.city) === c);
  if (!skill) return { exact: inCity, others: [] };
  const exact = inCity.filter(p => p.skills.includes(skill.id) || p.categories.includes(skill.category));
  return { exact, others: inCity.filter(p => !exact.includes(p)) };
}
export function mapsQuery(skillName, city) {
  return `${skillName ? skillName + ' workshop' : 'traditional craft workshop'} in ${city}`;
}
export function mapsEmbedUrl(q) { return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`; }
export function mapsOpenUrl(q) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`; }
