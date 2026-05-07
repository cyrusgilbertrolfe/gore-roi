export type UseCase = {
  id: string;
  slug: string;
  title: string;
  oneLiner: string;
};

export const USE_CASES: UseCase[] = [
  {
    id: "UC1",
    slug: "registration-warranty-returns",
    title: "Registration, Warranty & Returns",
    oneLiner: "One scan registers the product and opens a direct channel.",
  },
  {
    id: "UC2",
    slug: "repair-service",
    title: "Repair Service",
    oneLiner:
      "Validate every claim. Divert returns to repair. Run service profitably.",
  },
  {
    id: "UC3",
    slug: "resale",
    title: "Resale",
    oneLiner: "Capture the secondary market the brand built.",
  },
  {
    id: "UC4",
    slug: "anti-counterfeit",
    title: "Anti-Counterfeit",
    oneLiner: "Verify at sale, return, and warranty service.",
  },
  {
    id: "UC5",
    slug: "in-store-training",
    title: "In-Store Training",
    oneLiner: "Every associate, product-literate from day one.",
  },
  {
    id: "UC6",
    slug: "digital-id-analytics",
    title: "Digital ID Analytics",
    oneLiner: "Every scan is a signal demand forecasts don't capture.",
  },
  {
    id: "UC7",
    slug: "digital-product-experience",
    title: "Digital Product Experience",
    oneLiner:
      "Provenance, transparency, and engagement, on the product itself.",
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return USE_CASES.find((uc) => uc.slug === slug);
}
