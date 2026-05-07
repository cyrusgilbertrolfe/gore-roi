export type OutdoorSector =
  | "luxury-outdoor-techwear"
  | "outerwear"
  | "technical-alpine"
  | "athletic-sportswear"
  | "outdoor-lifestyle"
  | "performance-materials";

export type SectorMeta = {
  label: string;
  examples: string;
  /** % of original retail typically recovered on the secondary market */
  resaleValuePct: number;
  notes?: string;
};

export const SECTOR_DATA: Record<OutdoorSector, SectorMeta> = {
  "luxury-outdoor-techwear": {
    label: "Luxury Outdoor & Techwear",
    examples: "Arc'teryx, Veilance, Stone Island Shadow Project",
    resaleValuePct: 70,
    notes: "Strong functional demand sustains very high resale value.",
  },
  "outerwear": {
    label: "Outerwear",
    examples: "Patagonia, Canada Goose, Moncler, Fjällräven",
    resaleValuePct: 55,
    notes: "Coats and shells consistently retain value across seasons.",
  },
  "technical-alpine": {
    label: "Technical Alpine",
    examples: "Mammut, Black Diamond, La Sportiva, Ortovox",
    resaleValuePct: 60,
    notes: "High-trust segment — failure has consequences in the field.",
  },
  "athletic-sportswear": {
    label: "Athletic & Sportswear",
    examples: "Nike, Under Armour, Lululemon, On Running",
    resaleValuePct: 50,
    notes: "Performance pieces and limited drops retain significant value.",
  },
  "outdoor-lifestyle": {
    label: "Outdoor Lifestyle",
    examples: "Cotopaxi, Topo Designs, Snow Peak",
    resaleValuePct: 45,
  },
  "performance-materials": {
    label: "Performance Materials",
    examples: "Gore, Polartec, Pertex",
    resaleValuePct: 0,
    notes: "Materials suppliers — value model differs from finished-goods brands.",
  },
};

export type CurrencyCode = "USD" | "EUR" | "GBP";

export type BrandProfile = {
  brandName: string;
  sector: OutdoorSector | "";
  reportingCurrency: CurrencyCode;
  annualRevenue: number;
  ownStores: number;
  storeStaffPerStore: number;
  avgItemPrice: number;
  unitsSoldOwnStores: number;
  baselineReturnRate: number;
  channelMix: {
    ownStoresPct: number;
    ownEcomPct: number;
    wholesalePct: number;
  };
};

/** Outdoor-tuned starting values from the prep doc — for a $200M–$2B-revenue brand. */
export const DEFAULT_BRAND: BrandProfile = {
  brandName: "",
  sector: "",
  reportingCurrency: "USD",
  annualRevenue: 800_000_000,
  ownStores: 25,
  storeStaffPerStore: 8,
  avgItemPrice: 320,
  unitsSoldOwnStores: 450_000,
  baselineReturnRate: 12,
  channelMix: {
    ownStoresPct: 18,
    ownEcomPct: 32,
    wholesalePct: 50,
  },
};

export const BRAND_STORAGE_KEY = "gore-roi.brandProfile.v1";

/** Brands the calculator is not for. If a session starts with one of these,
 *  the wizard responds with a friendly redirect rather than letting them proceed. */
const NON_OUTDOOR_BRANDS = [
  "burberry", "zara", "hm", "h&m", "uniqlo", "gap",
  "prada", "gucci", "louis vuitton", "lv", "chanel", "dior",
  "balenciaga", "armani", "boss", "hugo boss", "ralph lauren",
  "tommy hilfiger", "calvin klein", "ck",
  "cos", "ganni", "acne", "acne studios", "ted baker", "reiss",
  "theory", "club monaco", "apc", "a.p.c.",
  "supreme", "off-white", "off white", "celine", "hermes", "hermès",
  "loewe", "valentino", "saint laurent", "ysl", "bottega veneta",
  "fendi", "versace", "miu miu", "moschino",
  "levis", "levi's", "wrangler", "carhartt", "nudie", "diesel",
];

export function isNonOutdoorBrand(brandName: string): boolean {
  const normalized = brandName.toLowerCase().trim();
  if (!normalized) return false;
  return NON_OUTDOOR_BRANDS.some((b) => {
    const bNorm = b.toLowerCase();
    return normalized === bNorm || normalized === bNorm.replace(/[^a-z0-9]/g, "");
  });
}
