// Nisab thresholds (grams)
export const NISAB_GOLD_GRAMS = 87.48;
export const NISAB_SILVER_GRAMS = 612.36;
export const ZAKAT_RATE = 0.025; // 2.5%
export const GRAMS_PER_VORI = 11.664; // 1 vori (ভরি) = 11.664 grams

// Nisab thresholds in vori (for display)
export const NISAB_GOLD_VORI = NISAB_GOLD_GRAMS / GRAMS_PER_VORI; // ~7.5 vori
export const NISAB_SILVER_VORI = NISAB_SILVER_GRAMS / GRAMS_PER_VORI; // ~52.5 vori

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

export function voriToGram(pricePerVori: number): number {
  return pricePerVori / GRAMS_PER_VORI;
}

export function calculateNisabValues(
  goldPricePerGram?: number,
  silverPricePerGram?: number
) {
  return {
    goldNisab: goldPricePerGram ? goldPricePerGram * NISAB_GOLD_GRAMS : null,
    silverNisab: silverPricePerGram ? silverPricePerGram * NISAB_SILVER_GRAMS : null,
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

// Uses the lowest available Nisab threshold (benefits more people)
// Prefers silver Nisab if available, falls back to gold
export function getNisabThreshold(
  goldNisab: number | null,
  silverNisab: number | null
): number | null {
  if (silverNisab && goldNisab) return Math.min(silverNisab, goldNisab);
  return silverNisab ?? goldNisab;
}

export function isNisabMet(
  totalWealth: number,
  nisabThreshold: number
): boolean {
  return totalWealth >= nisabThreshold;
}

export function calculateZakat(totalWealth: number): number {
  return Math.round(totalWealth * ZAKAT_RATE * 100) / 100;
}
