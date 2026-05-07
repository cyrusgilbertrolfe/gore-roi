import type { BrandProfile } from "@/app/brand/brandTypes";

type LineItem = { key: string; label: string; value: number };

export type ResaleAssumptions = {
  resaleParticipationRatePct: number;
  brandCaptureRatePct: number;
  resaleValuePct: number;
  endOfSeasonMarkdownPct: number;
  avgMarkdownDepthPct: number;
  markdownDiversionPct: number;
  cacValuePctOfAvgPrice: number;
};

function safe(n: unknown): number {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function pct(v: number): number {
  return safe(v) / 100;
}

export function calcResaleRoi(brand: BrandProfile, a: ResaleAssumptions) {
  const annualRevenue = safe(brand.annualRevenue);
  const avgPrice = safe(brand.avgItemPrice);

  const totalUnits =
    avgPrice > 0 && annualRevenue > 0 ? annualRevenue / avgPrice : 0;

  const resaleEligibleUnits = totalUnits * pct(a.resaleParticipationRatePct);
  const capturedUnits = resaleEligibleUnits * pct(a.brandCaptureRatePct);

  const resalePrice = avgPrice * pct(a.resaleValuePct);
  const resaleRevenue = capturedUnits * resalePrice;

  const markdownUnits = totalUnits * pct(a.endOfSeasonMarkdownPct);
  const divertedUnits = markdownUnits * pct(a.markdownDiversionPct);
  const markdownAvoidance =
    divertedUnits * avgPrice * pct(a.avgMarkdownDepthPct);

  const cacValue = avgPrice * pct(a.cacValuePctOfAvgPrice);
  const customerAcquisitionValue = capturedUnits * cacValue;

  const lineItems: LineItem[] = [
    {
      key: "resale-revenue",
      label: "Own-channel resale revenue (certified pre-owned programme)",
      value: resaleRevenue,
    },
    {
      key: "markdown-avoidance",
      label: "Markdown avoidance — end-of-season stock routed to resale",
      value: markdownAvoidance,
    },
    {
      key: "new-customers",
      label: "New customer acquisition from second buyers (CAC proxy)",
      value: customerAcquisitionValue,
    },
  ];

  const totalAnnualBenefit = lineItems.reduce((s, x) => s + x.value, 0);
  return { totalAnnualBenefit, lineItems };
}
