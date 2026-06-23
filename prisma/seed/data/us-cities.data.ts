/**
 * Major towns and cities for all Sierra Leone districts.
 * Used to seed Location rows (country + district + city).
 */
export const CITIES_BY_DISTRICT: Record<string, readonly string[]> = {
  WAU: [
    "Freetown",
    "Murray Town",
    "Lumley",
    "Aberdeen",
    "Kissy",
    "Goderich",
    "Wilberforce",
  ],
  WAR: [
    "Waterloo",
    "Hastings",
    "Tombo",
    "Grafton",
    "Kent",
    "York",
    "Regent",
  ],
  BOM: ["Makeni", "Kamalo", "Gbanti", "Pate Bana", "Binkolo"],
  KAM: ["Kambia", "Rokupr", "Mange", "Kukuna"],
  KOI: ["Kabala", "Sinkunia", "Koinadugu Town", "Falaba"],
  PLO: ["Port Loko", "Lungi", "Maforki", "Lunsar"],
  TON: ["Magburaka", "Matotoka", "Yele", "Mabonto"],
  FAL: ["Falaba Town", "Mongo", "Sambaia"],
  KAR: ["Kamakwie", "Buya Romende", "Kamaranka"],
  KAI: ["Kailahun", "Pendembu", "Segbwema", "Daru"],
  KEN: ["Kenema", "Blama", "Tongo Field", "Boajibu"],
  KON: ["Koidu", "Yengema", "Tombodu", "Motema"],
  BOD: ["Bo", "Tikonko", "Baoma", "Sumbuya", "Gerihun"],
  BON: ["Bonthe", "Mattru Jong", "Gbangbatok", "Tihun"],
  MOY: ["Moyamba", "Shenge", "Bumpeh", "Rotifunk"],
  PUJ: ["Pujehun", "Zimmi", "Potoru", "Bandajuma"],
};
