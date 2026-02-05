// Nisab thresholds (grams)
export const NISAB_GOLD_GRAMS = 87.48;
export const NISAB_SILVER_GRAMS = 612.36;
export const ZAKAT_RATE = 0.025; // 2.5%

// Simplified payment categories
export const PAYMENT_CATEGORIES = [
  "Poor/Needy",
  "Education",
  "Healthcare",
  "Debt Relief",
  "Islamic Cause",
  "Other",
] as const;

export type PaymentCategory = (typeof PAYMENT_CATEGORIES)[number];

export interface WealthBreakdown {
  cashAndBank: number;
  gold: number;
  silver: number;
  businessAssets: number;
  stocks: number;
  otherInvestments: number;
  receivables: number;
  liabilities: number;
}

export function calculateNisabValues(
  goldPricePerGram: number,
  silverPricePerGram: number
) {
  return {
    goldNisab: goldPricePerGram * NISAB_GOLD_GRAMS,
    silverNisab: silverPricePerGram * NISAB_SILVER_GRAMS,
  };
}

export function calculateTotalWealth(assets: WealthBreakdown): number {
  const totalAssets =
    assets.cashAndBank +
    assets.gold +
    assets.silver +
    assets.businessAssets +
    assets.stocks +
    assets.otherInvestments +
    assets.receivables;

  return Math.max(0, totalAssets - assets.liabilities);
}

// Uses silver Nisab (lower threshold — benefits more people)
export function isNisabMet(
  totalWealth: number,
  silverNisab: number
): boolean {
  return totalWealth >= silverNisab;
}

export function calculateZakat(totalWealth: number): number {
  return Math.round(totalWealth * ZAKAT_RATE * 100) / 100;
}
