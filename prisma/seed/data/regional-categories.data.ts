import type { RegionSlug } from "./us-regions";

export type NationalCategorySeed = {
  name: string;
  slug: string;
  description: string;
};

export type NationalSubcategorySeed = {
  name: string;
  slug: string;
  description: string;
};

export type RegionalCategorySeed = {
  name: string;
  slug: string;
  description: string;
};

/** Top-level categories available nationwide across Sierra Leone */
export const NATIONAL_CATEGORIES: NationalCategorySeed[] = [
  {
    name: "Tourism",
    slug: "tourism",
    description:
      "Travel, hospitality, heritage sites, and visitor attractions across Sierra Leone.",
  },
  {
    name: "General Education",
    slug: "general-education",
    description:
      "Schools, colleges, universities, and learning institutions at all levels.",
  },
  {
    name: "Healthcare",
    slug: "healthcare",
    description:
      "Hospitals, clinics, pharmacies, and all health and medical services.",
  },
  {
    name: "Agriculture",
    slug: "agriculture",
    description:
      "Farming, livestock, fisheries, agro-processing, and agricultural services.",
  },
  {
    name: "Government Services",
    slug: "government-services",
    description:
      "Public sector agencies delivering civic, administrative, and citizen services.",
  },
];

/** Subcategories (keywords) nested under each national category */
export const NATIONAL_CATEGORY_SUBCATEGORIES: Record<
  string,
  NationalSubcategorySeed[]
> = {
  tourism: [
    {
      name: "Travel",
      slug: "travel",
      description: "Travel agencies and tour operators.",
    },
    {
      name: "Vacation",
      slug: "vacation",
      description: "Vacation packages and holiday planning services.",
    },
    {
      name: "Holiday",
      slug: "holiday",
      description: "Holiday providers and seasonal travel services.",
    },
    {
      name: "Journey",
      slug: "journey",
      description: "Journey planning and guided tour services.",
    },
    {
      name: "Trip",
      slug: "trip",
      description: "Day trips, excursions, and short-stay experiences.",
    },
    {
      name: "Monument",
      slug: "monument",
      description: "Historical monuments and heritage landmarks.",
    },
    {
      name: "Museum",
      slug: "museum",
      description: "Museums and cultural artifact collections.",
    },
    {
      name: "Gallery",
      slug: "gallery",
      description: "Art galleries and exhibition spaces.",
    },
    {
      name: "Beach",
      slug: "beach",
      description: "Beach resorts, beach bars, and coastal leisure.",
    },
    {
      name: "Waterfall",
      slug: "waterfall",
      description: "Waterfall sites and nature excursions.",
    },
    {
      name: "National Park",
      slug: "national-park",
      description: "National parks and protected natural areas.",
    },
    {
      name: "Wildlife Reserve",
      slug: "wildlife-reserve",
      description: "Wildlife reserves and safari experiences.",
    },
    {
      name: "Historical Site",
      slug: "historical-site",
      description: "Historical sites and heritage conservation.",
    },
    {
      name: "Cultural Center",
      slug: "cultural-center",
      description: "Cultural centers and community arts venues.",
    },
    {
      name: "Hotel",
      slug: "hotel",
      description: "Hotels and full-service accommodation.",
    },
    {
      name: "Resort",
      slug: "resort",
      description: "Resorts and luxury leisure accommodation.",
    },
    {
      name: "Motel",
      slug: "motel",
      description: "Motels and roadside accommodation.",
    },
    {
      name: "Guest House",
      slug: "guest-house",
      description: "Guest houses and bed-and-breakfast accommodation.",
    },
    {
      name: "Hostel",
      slug: "hostel",
      description: "Hostels and budget traveller accommodation.",
    },
    {
      name: "Lodge",
      slug: "lodge",
      description: "Lodges and eco-accommodation in nature settings.",
    },
  ],

  "general-education": [
    {
      name: "School",
      slug: "school",
      description: "Primary and secondary schools.",
    },
    {
      name: "College",
      slug: "college",
      description: "Colleges offering diploma and certificate programmes.",
    },
    {
      name: "University",
      slug: "university",
      description: "Degree-granting universities and higher education institutions.",
    },
    {
      name: "Academy",
      slug: "academy",
      description: "Specialist academies for arts, sciences, or sports.",
    },
    {
      name: "Institute",
      slug: "institute",
      description: "Professional and technical institutes.",
    },
    {
      name: "Polytechnic",
      slug: "polytechnic",
      description: "Polytechnics offering applied technical education.",
    },
    {
      name: "Vocational Center",
      slug: "vocational-center",
      description: "Vocational and skills training centres.",
    },
    {
      name: "Training Center",
      slug: "training-center",
      description: "Professional development and workforce training centres.",
    },
    {
      name: "Campus",
      slug: "campus",
      description: "University and college campuses and satellite sites.",
    },
    {
      name: "Library",
      slug: "library",
      description: "Public and institutional libraries.",
    },
    {
      name: "Science Laboratory",
      slug: "education-laboratory",
      description: "Educational laboratories and science facilities.",
    },
    {
      name: "Classroom",
      slug: "classroom",
      description: "Classroom-based learning facilities and tutoring centres.",
    },
  ],

  healthcare: [
    {
      name: "Hospital",
      slug: "hospital",
      description: "General and specialist hospitals.",
    },
    {
      name: "Clinic",
      slug: "clinic",
      description: "Outpatient clinics and community health clinics.",
    },
    {
      name: "Health Center",
      slug: "health-center",
      description: "Primary health centres and community health posts.",
    },
    {
      name: "Medical Center",
      slug: "medical-center",
      description: "Multi-specialty medical centres.",
    },
    {
      name: "Pharmacy",
      slug: "pharmacy",
      description: "Pharmacies and medicine dispensaries.",
    },
    {
      name: "Diagnostic Laboratory",
      slug: "medical-laboratory",
      description: "Diagnostic laboratories and pathology services.",
    },
    {
      name: "Emergency Room",
      slug: "emergency-room",
      description: "Emergency and accident & emergency services.",
    },
    {
      name: "Intensive Care Unit (ICU)",
      slug: "icu",
      description: "Intensive care and critical care units.",
    },
    {
      name: "Maternity Ward",
      slug: "maternity-ward",
      description: "Maternity wards and maternal health services.",
    },
    {
      name: "Surgical Center",
      slug: "surgical-center",
      description: "Surgical theatres and day-surgery facilities.",
    },
    {
      name: "Dental Clinic",
      slug: "dental-clinic",
      description: "Dental clinics and oral health services.",
    },
    {
      name: "Eye Clinic",
      slug: "eye-clinic",
      description: "Ophthalmology clinics and vision care services.",
    },
    {
      name: "Nursing Home",
      slug: "nursing-home",
      description: "Nursing homes and long-term care facilities.",
    },
    {
      name: "Rehabilitation Center",
      slug: "rehabilitation-center",
      description: "Physiotherapy, rehab, and recovery centres.",
    },
    {
      name: "Ambulance Service",
      slug: "ambulance-service",
      description: "Emergency ambulance and patient transport services.",
    },
  ],

  agriculture: [
    {
      name: "Farmers",
      slug: "farmers",
      description: "Individual and smallholder farmers.",
    },
    {
      name: "Farms",
      slug: "farms",
      description: "Commercial and subsistence farms.",
    },
    {
      name: "Livestock",
      slug: "livestock",
      description: "Cattle, goat, sheep, and livestock rearing.",
    },
    {
      name: "Poultry",
      slug: "poultry",
      description: "Poultry farming and egg production.",
    },
    {
      name: "Fisheries",
      slug: "fisheries",
      description: "Artisanal and commercial fisheries.",
    },
    {
      name: "Agricultural Suppliers",
      slug: "agricultural-suppliers",
      description: "Suppliers of agricultural inputs and tools.",
    },
    {
      name: "Farm Equipment",
      slug: "farm-equipment",
      description: "Farm machinery dealers and equipment rentals.",
    },
    {
      name: "Seed Suppliers",
      slug: "seed-suppliers",
      description: "Certified seed producers and distributors.",
    },
    {
      name: "Fertilizer Dealers",
      slug: "fertilizer-dealers",
      description: "Fertilizer and soil amendment suppliers.",
    },
    {
      name: "Veterinary Services",
      slug: "veterinary-services",
      description: "Animal health clinics and veterinary practitioners.",
    },
    {
      name: "Irrigation Services",
      slug: "irrigation-services",
      description: "Irrigation installation and water management services.",
    },
    {
      name: "Agricultural Cooperatives",
      slug: "agricultural-cooperatives",
      description: "Farmer cooperatives and producer groups.",
    },
    {
      name: "Produce Markets",
      slug: "produce-markets",
      description: "Fresh produce markets and agricultural trading hubs.",
    },
    {
      name: "Agro-processing",
      slug: "agro-processing",
      description: "Processing of agricultural produce into food products.",
    },
    {
      name: "Agricultural Training Centers",
      slug: "agricultural-training-centers",
      description: "Centres for farmer training and agri-skills development.",
    },
    {
      name: "Extension Services",
      slug: "extension-services",
      description:
        "Government and NGO agricultural advisory and extension services.",
    },
    {
      name: "Exporters",
      slug: "agri-exporters",
      description: "Agricultural commodity exporters and trading companies.",
    },
    {
      name: "Agritech Companies",
      slug: "agritech-companies",
      description: "Technology companies serving the agricultural sector.",
    },
    {
      name: "Feed Suppliers",
      slug: "feed-suppliers",
      description: "Animal feed producers and distributors.",
    },
    {
      name: "Crop Production",
      slug: "crop-production",
      description: "Crop cultivation and harvest services.",
    },
  ],

  "government-services": [
    {
      name: "Passport Services",
      slug: "passport-services",
      description: "Passport application and renewal services.",
    },
    {
      name: "National ID Services",
      slug: "national-id-services",
      description: "National identification card issuance and management.",
    },
    {
      name: "Driver's License",
      slug: "drivers-license",
      description: "Driver's license application and renewal services.",
    },
    {
      name: "Tax Services",
      slug: "tax-services",
      description: "Revenue authority and tax compliance services.",
    },
    {
      name: "Business Registration",
      slug: "business-registration",
      description: "Company and business name registration services.",
    },
    {
      name: "Land Registration",
      slug: "land-registration",
      description: "Land and property registration and deed services.",
    },
    {
      name: "Immigration Services",
      slug: "immigration-services",
      description: "Visa, residency, and immigration processing services.",
    },
    {
      name: "Police Services",
      slug: "police-services",
      description: "Sierra Leone Police stations and community policing.",
    },
    {
      name: "Public Hospitals",
      slug: "public-hospitals",
      description: "Government-operated hospitals and health facilities.",
    },
    {
      name: "Schools",
      slug: "government-schools",
      description: "Government-owned primary and secondary schools.",
    },
    {
      name: "Courts",
      slug: "courts",
      description: "Judiciary courts and legal dispute resolution services.",
    },
    {
      name: "Municipal Services",
      slug: "municipal-services",
      description: "City and local council services and infrastructure.",
    },
    {
      name: "Social Welfare",
      slug: "social-welfare",
      description: "Social protection, grants, and welfare services.",
    },
    {
      name: "Public Procurement",
      slug: "public-procurement",
      description: "Government tendering and procurement offices.",
    },
    {
      name: "E-Government Services",
      slug: "e-government-services",
      description: "Online government portals and digital citizen services.",
    },
    {
      name: "Public Utilities",
      slug: "public-utilities",
      description: "Electricity, water, and sanitation utility services.",
    },
    {
      name: "Environmental Services",
      slug: "environmental-services",
      description: "Environmental protection and waste management agencies.",
    },
    {
      name: "Pension Services",
      slug: "pension-services",
      description:
        "National Social Security and Insurance Trust (NASSIT) and pension services.",
    },
    {
      name: "Licensing Services",
      slug: "licensing-services",
      description: "Business, professional, and trade licensing authorities.",
    },
    {
      name: "Citizen Support",
      slug: "citizen-support",
      description: "General public information and citizen helpdesk services.",
    },
  ],
};

/** Industry specialties grouped by Sierra Leone province */
export const REGIONAL_CATEGORY_SPECIALTIES: Record<
  RegionSlug,
  RegionalCategorySeed[]
> = {
  "western-area": [
    {
      name: "Financial Services",
      slug: "financial-services",
      description:
        "Banking, microfinance, mobile money, and insurance (Western Area).",
    },
    {
      name: "Government & Public Services",
      slug: "government-public-services",
      description:
        "Public sector agencies and NGO operations (Western Area).",
    },
    {
      name: "Telecommunications",
      slug: "telecommunications",
      description:
        "Mobile networks, internet providers, and ICT services (Western Area).",
    },
    {
      name: "Import & Export Trade",
      slug: "import-export-trade",
      description:
        "Wholesale trade, customs brokerage, and port commerce (Western Area).",
    },
    {
      name: "Hospitality & Tourism",
      slug: "hospitality-tourism",
      description:
        "Hotels, guesthouses, and city tourism services (Western Area).",
    },
  ],
  "northern-province": [
    {
      name: "Rice & Grain Farming",
      slug: "rice-grain-farming",
      description:
        "Upland and swamp rice cultivation and processing (Northern Province).",
    },
    {
      name: "Livestock & Cattle",
      slug: "livestock-cattle",
      description:
        "Cattle rearing, poultry, and dairy farming (Northern Province).",
    },
    {
      name: "Iron Ore & Minerals",
      slug: "iron-ore-minerals",
      description:
        "Mining operations and mineral extraction (Northern Province).",
    },
    {
      name: "Groundnut & Oil Processing",
      slug: "groundnut-oil-processing",
      description:
        "Groundnut production and palm oil processing (Northern Province).",
    },
    {
      name: "Rural Transport & Logistics",
      slug: "rural-transport-logistics",
      description:
        "Motorcycle taxis, truck haulage, and rural supply chains (Northern Province).",
    },
  ],
  "north-west-province": [
    {
      name: "Artisanal Fishing",
      slug: "artisanal-fishing",
      description:
        "Coastal and river fishing and fish processing (North West Province).",
    },
    {
      name: "Timber & Forestry",
      slug: "timber-forestry",
      description:
        "Timber harvesting and wood processing (North West Province).",
    },
    {
      name: "Cocoa & Coffee Farming",
      slug: "cocoa-coffee-farming",
      description: "Cash crop cultivation and export (North West Province).",
    },
    {
      name: "Community Retail",
      slug: "community-retail",
      description:
        "Local market traders and retail cooperatives (North West Province).",
    },
    {
      name: "Ecotourism & Wildlife",
      slug: "ecotourism-wildlife",
      description:
        "Nature-based tourism and community conservation (North West Province).",
    },
  ],
  "eastern-province": [
    {
      name: "Diamond Mining",
      slug: "diamond-mining",
      description:
        "Artisanal and industrial diamond extraction (Eastern Province).",
    },
    {
      name: "Gold & Precious Minerals",
      slug: "gold-precious-minerals",
      description: "Gold panning and mineral trading (Eastern Province).",
    },
    {
      name: "Coffee & Cocoa Export",
      slug: "coffee-cocoa-export",
      description:
        "Smallholder and cooperative cash crop export (Eastern Province).",
    },
    {
      name: "Timber & Charcoal",
      slug: "timber-charcoal",
      description:
        "Forest products and charcoal production (Eastern Province).",
    },
    {
      name: "Cross-Border Trade",
      slug: "cross-border-trade",
      description:
        "Commerce along Guinea and Liberia border corridors (Eastern Province).",
    },
  ],
  "southern-province": [
    {
      name: "Palm Oil Production",
      slug: "palm-oil-production",
      description:
        "Smallholder and industrial palm oil processing (Southern Province).",
    },
    {
      name: "Cocoa & Coffee Agribusiness",
      slug: "cocoa-coffee-agribusiness",
      description:
        "Export-grade cocoa and coffee value chains (Southern Province).",
    },
    {
      name: "Marine Fishing",
      slug: "marine-fishing",
      description:
        "Deep-sea and artisanal fishing and processing (Southern Province).",
    },
    {
      name: "Agriculture & Food Processing",
      slug: "agriculture-food-processing",
      description:
        "Cassava, sweet potato, and local food manufacturing (Southern Province).",
    },
    {
      name: "Education & Vocational Training",
      slug: "education-vocational-training",
      description:
        "Schools, skills centres, and workforce development (Southern Province).",
    },
  ],
};
