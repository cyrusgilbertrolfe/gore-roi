import type { BrandProfile } from "@/app/brand/brandTypes";

export type AntiCounterfeitAssumptions = {
  counterfeitShareOfReturnsPct: number;
  grossMarginPct: number;
  warrantyClaimsPerYear: number;
  warrantyFraudRatePct: number;
  avgWarrantyCost: number;
};

type LineItem = { key: string; label: string; value: number };

export function calcAntiCounterfeitRoi(
  brand: BrandProfile,
  a: AntiCounterfeitAssumptions
) {
  const annualRevenue = Number(brand?.annualRevenue ?? 0);
  const avgPrice = Number(brand?.avgItemPrice ?? 0);
  const baselineReturnRatePct = Number(brand?.baselineReturnRate ?? 0);

  const grossMarginPct = Number(a.grossMarginPct ?? 0);
  const counterfeitShareOfReturnsPct = Number(
    a.counterfeitShareOfReturnsPct ?? 0
  );

  const warrantyClaimsPerYear = Number(a.warrantyClaimsPerYear ?? 0);
  const warrantyFraudRatePct = Number(a.warrantyFraudRatePct ?? 0);
  const avgWarrantyCost = Number(a.avgWarrantyCost ?? 0);

  const unitsEstimated =
    annualRevenue > 0 && avgPrice > 0 ? annualRevenue / avgPrice : 0;
  const returnsTotal = unitsEstimated * (baselineReturnRatePct / 100);
  const fraudulentReturns =
    returnsTotal * (counterfeitShareOfReturnsPct / 100);
  const marginPerUnit = avgPrice * (grossMarginPct / 100);

  const returnFraudSaving = fraudulentReturns * marginPerUnit;
  const warrantyFraudSaving =
    warrantyClaimsPerYear * (warrantyFraudRatePct / 100) * avgWarrantyCost;

  const totalAnnualBenefit = returnFraudSaving + warrantyFraudSaving;

  const lineItems: LineItem[] = [
    {
      key: "returns",
      label: "Reduced fraudulent returns (margin protected)",
      value: returnFraudSaving,
    },
    {
      key: "warranty",
      label: "Reduced warranty fraud (service cost avoided)",
      value: warrantyFraudSaving,
    },
  ];

  return { totalAnnualBenefit, lineItems };
}
