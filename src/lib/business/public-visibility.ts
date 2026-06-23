import type { Prisma } from "@prisma/client";

/** Businesses visible in public search and profile pages. */
export const publicBusinessWhere: Prisma.BusinessWhereInput = {
  verificationStatus: "APPROVED",
};

/** Verified businesses only (badge + admin approval). */
export const verifiedBusinessWhere: Prisma.BusinessWhereInput = {
  verificationStatus: "APPROVED",
  isVerified: true,
};

export const TOP_RATED_MIN = 2;
export const TOP_RATED_MAX = 5;

export const topRatedRangeWhere: Prisma.BusinessWhereInput = {
  averageRating: { gte: TOP_RATED_MIN, lte: TOP_RATED_MAX },
};

const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "best",
  "by",
  "find",
  "for",
  "from",
  "in",
  "list",
  "me",
  "of",
  "on",
  "show",
  "service",
  "services",
  "the",
  "to",
  "with",
]);

const SEARCH_SYNONYMS: Record<string, string[]> = {
  // Tourism & hospitality intent
  tourism: ["travel", "vacation", "holiday", "journey", "trip", "tourist", "hospitality"],
  travel: ["tourism", "trip", "journey", "vacation", "holiday", "tour"],
  vacation: ["tourism", "travel", "holiday", "trip"],
  holiday: ["tourism", "travel", "vacation", "trip"],
  journey: ["tourism", "travel", "trip"],
  trip: ["tourism", "travel", "journey"],
  monument: ["tourism", "historical", "cultural", "site"],
  museum: ["tourism", "gallery", "historical", "cultural"],
  gallery: ["tourism", "museum", "cultural"],
  hotel: ["hotels", "hospitality", "tourism", "lodging", "accommodation"],
  hotels: ["hotel", "hospitality", "tourism", "lodging", "accommodation"],
  motel: ["hotel", "hospitality", "tourism", "lodging", "accommodation"],
  guest: ["guesthouse", "hotel", "hospitality", "tourism", "accommodation"],
  guesthouse: ["guest", "hotel", "hospitality", "tourism", "accommodation"],
  hostel: ["hotel", "hospitality", "tourism", "accommodation", "lodging"],
  lodge: ["lodging", "hotel", "tourism", "hospitality"],
  resort: ["hotel", "tourism", "hospitality", "travel", "accommodation"],
  beach: ["tourism", "travel", "hospitality", "resort"],
  waterfall: ["tourism", "travel", "nature"],
  park: ["tourism", "national", "wildlife", "nature"],
  national: ["tourism", "park", "wildlife", "historical", "government", "id", "services"],
  wildlife: ["tourism", "reserve", "park", "nature"],
  reserve: ["tourism", "wildlife", "park", "nature"],
  historical: ["tourism", "monument", "museum", "cultural", "site"],
  cultural: ["tourism", "museum", "historical", "center"],
  center: ["centre", "service", "services"],
  centre: ["center", "service", "services"],
  safari: ["tourism", "travel", "hospitality"],
  tour: ["tourism", "travel", "hospitality"],
  club: ["clubs", "bar", "bars", "nightlife", "hospitality", "tourism"],
  clubs: ["club", "bar", "bars", "nightlife", "hospitality", "tourism"],
  bar: ["bars", "club", "clubs", "nightlife", "hospitality", "tourism"],
  bars: ["bar", "club", "clubs", "nightlife", "hospitality", "tourism"],
  pub: ["bar", "bars", "club", "nightlife", "hospitality", "tourism"],
  lounge: ["bar", "club", "nightlife", "hospitality", "tourism"],
  nightlife: ["club", "bar", "bars", "tourism", "hospitality"],
  tourist: ["tourism", "hospitality", "hotel", "travel"],

  // Education intent
  education: ["school", "college", "university", "academy", "institute", "polytechnic", "training", "campus", "library", "classroom", "laboratory"],
  // Healthcare intent
  healthcare: ["hospital", "clinic", "medical", "pharmacy", "health"],
  medical: ["healthcare", "hospital", "clinic", "pharmacy"],
  clinic: ["healthcare", "medical", "hospital"],
  health: ["healthcare", "medical", "hospital", "clinic"],
  hospital: ["healthcare", "medical", "clinic"],
  emergency: ["hospital", "healthcare", "medical", "ambulance"],
  room: ["emergency", "hospital", "clinic"],
  icu: ["hospital", "healthcare", "emergency", "intensive"],
  intensive: ["icu", "hospital", "healthcare"],
  maternity: ["hospital", "healthcare", "clinic"],
  surgical: ["hospital", "healthcare", "medical"],
  dental: ["dentist", "clinic", "healthcare", "medical"],
  eye: ["clinic", "hospital", "healthcare", "medical"],
  nursing: ["nurse", "healthcare", "hospital"],
  rehabilitation: ["healthcare", "clinic", "medical"],
  ambulance: ["emergency", "hospital", "healthcare"],
  doctor: ["healthcare", "medical", "clinic", "hospital"],
  dentist: ["healthcare", "medical", "clinic"],
  pharmacy: ["healthcare", "medical", "clinic"],
  nurse: ["healthcare", "medical", "hospital"],

  // Education intent
  school: ["education", "academy", "learning"],
  college: ["education", "academy", "learning", "school"],
  university: ["education", "academy", "learning", "school"],
  academy: ["education", "school", "college", "learning", "training"],
  institute: ["education", "academy", "training", "learning"],
  polytechnic: ["education", "institute", "training", "vocational"],
  vocational: ["education", "training", "polytechnic", "institute"],
  campus: ["education", "school", "college", "university"],
  library: ["education", "school", "college", "university"],
  classroom: ["education", "school", "academy", "training"],
  laboratory: ["education", "healthcare", "medical", "school"],
  tutor: ["education", "academy", "learning", "school"],
  training: ["education", "academy", "learning"],

  // Agriculture intent
  agriculture: ["farm", "farming", "agro", "crop", "livestock", "poultry", "fisheries"],
  agricultural: ["agriculture", "farm", "farming", "agro", "suppliers"],
  farmers: ["farmer", "farm", "farming", "agriculture"],
  farmer: ["farmers", "farm", "farming", "agriculture"],
  farms: ["farm", "farming", "agriculture"],
  farm: ["agriculture", "agro", "farming"],
  farming: ["agriculture", "agro", "farm"],
  agro: ["agriculture", "farm", "farming"],
  crop: ["agriculture", "farm", "farming"],
  crops: ["agriculture", "farm", "farming"],
  fisheries: ["fishery", "agriculture", "farm", "aquaculture"],
  fishery: ["fisheries", "agriculture", "farm", "aquaculture"],
  aquaculture: ["fisheries", "fishery", "agriculture"],
  equipment: ["farm", "agriculture", "suppliers"],
  supplier: ["suppliers", "agriculture", "farm", "seed", "fertilizer", "feed"],
  suppliers: ["supplier", "agriculture", "farm", "seed", "fertilizer", "feed"],
  seed: ["agriculture", "suppliers", "farm"],
  seeds: ["seed", "agriculture", "suppliers", "farm"],
  fertilizer: ["agriculture", "farm", "suppliers"],
  fertilizers: ["fertilizer", "agriculture", "farm", "suppliers"],
  veterinary: ["agriculture", "livestock", "farm", "healthcare"],
  irrigation: ["agriculture", "farm", "crop"],
  cooperative: ["agriculture", "farmers", "farm"],
  cooperatives: ["cooperative", "agriculture", "farmers", "farm"],
  produce: ["agriculture", "farm", "crop", "market"],
  processing: ["agro", "agriculture", "produce"],
  exporters: ["export", "agriculture", "produce"],
  export: ["exporters", "agriculture", "produce"],
  agritech: ["agriculture", "agro", "technology"],
  feed: ["livestock", "poultry", "agriculture", "farm"],
  poultry: ["agriculture", "farm", "farming"],
  livestock: ["agriculture", "farm", "farming"],

  // Government services intent
  government: ["public", "civic", "services", "ministry", "documentation", "citizen"],
  passport: ["government", "public", "documentation", "services", "immigration", "id"],
  id: ["national", "government", "public", "services", "documentation"],
  driver: ["license", "government", "public", "services"],
  license: ["government", "public", "documentation", "services", "licensing"],
  licensing: ["license", "government", "public", "permit", "services"],
  tax: ["government", "public", "services", "registration"],
  registration: ["government", "public", "services", "license", "land", "business"],
  business: ["registration", "license", "government", "services"],
  land: ["registration", "government", "public", "services"],
  immigration: ["passport", "government", "public", "services"],
  police: ["government", "public", "services", "citizen"],
  courts: ["court", "government", "public", "services"],
  court: ["courts", "government", "public", "services"],
  municipal: ["government", "public", "services", "citizen"],
  welfare: ["social", "government", "public", "services"],
  social: ["welfare", "government", "public", "services"],
  procurement: ["government", "public", "services"],
  egovernment: ["government", "digital", "public", "services"],
  utilities: ["utility", "government", "public", "services"],
  utility: ["utilities", "government", "public", "services"],
  environmental: ["environment", "government", "public", "services"],
  environment: ["environmental", "government", "public", "services"],
  pension: ["government", "public", "services", "welfare"],
  citizen: ["government", "public", "support", "services"],
  support: ["citizen", "government", "public", "services"],
  ministry: ["government", "public", "services", "civic"],
  permit: ["government", "public", "documentation", "services"],
  document: ["government", "public", "documentation", "services"],
  documentation: ["government", "public", "document", "services"],
  civic: ["government", "public", "services", "documentation"],
  public: ["government", "civic", "services"],
};

function normalizeSearchTokens(query: string) {
  const baseTokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length >= 3 && !SEARCH_STOP_WORDS.has(token),
    );

  const expandedTokens = new Set(baseTokens);
  for (const token of baseTokens) {
    const synonyms = SEARCH_SYNONYMS[token];
    if (!synonyms) {
      continue;
    }
    for (const synonym of synonyms) {
      if (synonym.length >= 3 && !SEARCH_STOP_WORDS.has(synonym)) {
        expandedTokens.add(synonym);
      }
    }
  }

  return Array.from(expandedTokens);
}

function tokenFieldMatchers(token: string): Prisma.BusinessWhereInput[] {
  return [
    { businessName: { contains: token, mode: "insensitive" as const } },
    { description: { contains: token, mode: "insensitive" as const } },
    {
      category: {
        name: { contains: token, mode: "insensitive" as const },
      },
    },
    {
      location: {
        city: { contains: token, mode: "insensitive" as const },
      },
    },
    {
      location: {
        stateProvince: { contains: token, mode: "insensitive" as const },
      },
    },
    {
      location: {
        country: { contains: token, mode: "insensitive" as const },
      },
    },
  ];
}

export function buildBusinessTextSearchWhere(
  query: string,
): Prisma.BusinessWhereInput {
  const baseTokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length >= 3 && !SEARCH_STOP_WORDS.has(token),
    );

  if (baseTokens.length === 0) {
    return {};
  }

  const uniqueBaseTokens = Array.from(new Set(baseTokens));
  const tokenGroups = uniqueBaseTokens.map((token) => {
    const expanded = normalizeSearchTokens(token);
    const alternatives = expanded.length > 0 ? expanded : [token];
    return {
      OR: alternatives.flatMap((alt) => tokenFieldMatchers(alt)),
    };
  });

  return {
    AND: tokenGroups,
  };
}
