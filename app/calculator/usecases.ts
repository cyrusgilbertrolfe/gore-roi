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
    title: "Smart Label Analytics",
    oneLiner: "Every scan is a signal demand forecasts don't capture.",
  },
  {
    id: "UC7",
    slug: "digital-product-experience",
    title: "Smart Label Experience",
    oneLiner:
      "Provenance, transparency, and engagement, on the product itself.",
  },
  {
    id: "UC8",
    slug: "manufacturing-visibility",
    title: "Supply Chain Impact",
    oneLiner:
      "Vendor OTD up, customer penalties down, immediate business up. Ralf McCulkey's model.",
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return USE_CASES.find((uc) => uc.slug === slug);
}
