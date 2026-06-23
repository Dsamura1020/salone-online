export type RegionSlug =
  | "western-area"
  | "northern-province"
  | "north-west-province"
  | "eastern-province"
  | "southern-province";

export type SLRegionDefinition = {
  slug: RegionSlug;
  name: string;
  description: string;
  districtCodes: string[];
};

/** Sierra Leone administrative provinces/regions for category grouping */
export const SL_REGIONS: SLRegionDefinition[] = [
  {
    slug: "western-area",
    name: "Western Area",
    description:
      "The capital territory and economic hub of Sierra Leone, home to Freetown.",
    districtCodes: ["WAU", "WAR"],
  },
  {
    slug: "northern-province",
    name: "Northern Province",
    description:
      "Agricultural and mining heartland spanning five districts in the north.",
    districtCodes: ["BOM", "KAM", "KOI", "PLO", "TON"],
  },
  {
    slug: "north-west-province",
    name: "North West Province",
    description:
      "Coastal and inland farming region established in 2017 with two districts.",
    districtCodes: ["FAL", "KAR"],
  },
  {
    slug: "eastern-province",
    name: "Eastern Province",
    description:
      "Rich in diamonds and iron ore, driving Sierra Leone's mining economy.",
    districtCodes: ["KAI", "KEN", "KON"],
  },
  {
    slug: "southern-province",
    name: "Southern Province",
    description:
      "Agricultural region producing cocoa, coffee, and palm oil for export.",
    districtCodes: ["BOD", "BON", "MOY", "PUJ"],
  },
];

export const DISTRICT_NAMES: Record<string, string> = {
  WAU: "Western Area Urban",
  WAR: "Western Area Rural",
  BOM: "Bombali",
  KAM: "Kambia",
  KOI: "Koinadugu",
  PLO: "Port Loko",
  TON: "Tonkolili",
  FAL: "Falaba",
  KAR: "Karene",
  KAI: "Kailahun",
  KEN: "Kenema",
  KON: "Kono",
  BOD: "Bo",
  BON: "Bonthe",
  MOY: "Moyamba",
  PUJ: "Pujehun",
};

export const ALL_SL_DISTRICT_CODES = Object.keys(DISTRICT_NAMES);

export function getRegionForDistrict(districtCode: string): SLRegionDefinition {
  const region = SL_REGIONS.find((r) => r.districtCodes.includes(districtCode));
  if (!region) {
    throw new Error(`No region configured for district: ${districtCode}`);
  }
  return region;
}
