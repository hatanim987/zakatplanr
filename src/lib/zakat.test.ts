import { describe, it, expect } from "vitest";
import {
  calculateZakat,
  calculateTotalWealth,
  calculateNisabValues,
  getNisabThreshold,
  isNisabMet,
  voriToGram,
  toTotalVori,
  NISAB_GOLD_GRAMS,
  NISAB_SILVER_GRAMS,
  GRAMS_PER_VORI,
} from "./zakat";

describe("calculateZakat", () => {
  it("calculates 2.5% of wealth", () => {
    expect(calculateZakat(100000)).toBe(2500);
    expect(calculateZakat(2625000)).toBe(65625);
  });

  it("returns 0 for zero wealth", () => {
    expect(calculateZakat(0)).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    expect(calculateZakat(33333)).toBe(833.33);
  });
});

describe("calculateTotalWealth", () => {
  it("sums all assets minus liabilities", () => {
    const result = calculateTotalWealth({
      cashAndBank: 100000,
      gold: 500000,
      silver: 50000,
      businessAssets: 0,
      stocks: 0,
      otherInvestments: 0,
      receivables: 0,
      liabilities: 50000,
    });
    expect(result).toBe(600000);
  });

  it("returns 0 when liabilities exceed assets", () => {
    const result = calculateTotalWealth({
      cashAndBank: 10000,
      gold: 0,
      silver: 0,
      businessAssets: 0,
      stocks: 0,
      otherInvestments: 0,
      receivables: 0,
      liabilities: 50000,
    });
    expect(result).toBe(0);
  });

  it("includes all asset categories", () => {
    const result = calculateTotalWealth({
      cashAndBank: 100,
      gold: 200,
      silver: 300,
      businessAssets: 400,
      stocks: 500,
      otherInvestments: 600,
      receivables: 700,
      liabilities: 0,
    });
    expect(result).toBe(2800);
  });
});

describe("calculateNisabValues", () => {
  it("calculates gold and silver Nisab from per-gram prices", () => {
    const result = calculateNisabValues(100, 10);
    expect(result.goldNisab).toBe(100 * NISAB_GOLD_GRAMS);
    expect(result.silverNisab).toBe(10 * NISAB_SILVER_GRAMS);
  });

  it("returns null for missing prices", () => {
    expect(calculateNisabValues(undefined, 10).goldNisab).toBeNull();
    expect(calculateNisabValues(100, undefined).silverNisab).toBeNull();
  });
});

describe("getNisabThreshold", () => {
  it("returns the lower of gold and silver Nisab", () => {
    expect(getNisabThreshold(10000, 8000)).toBe(8000);
    expect(getNisabThreshold(5000, 8000)).toBe(5000);
  });

  it("returns whichever is available when one is null", () => {
    expect(getNisabThreshold(10000, null)).toBe(10000);
    expect(getNisabThreshold(null, 8000)).toBe(8000);
  });

  it("returns null when both are null", () => {
    expect(getNisabThreshold(null, null)).toBeNull();
  });
});

describe("isNisabMet", () => {
  it("returns true when wealth >= threshold", () => {
    expect(isNisabMet(100000, 87480)).toBe(true);
    expect(isNisabMet(87480, 87480)).toBe(true);
  });

  it("returns false when wealth < threshold", () => {
    expect(isNisabMet(50000, 87480)).toBe(false);
  });
});

describe("voriToGram", () => {
  it("converts price per vori to price per gram", () => {
    const pricePerVori = 116640; // 116,640 BDT/vori
    const pricePerGram = pricePerVori / GRAMS_PER_VORI;
    expect(voriToGram(pricePerVori)).toBeCloseTo(pricePerGram);
  });
});

describe("toTotalVori", () => {
  it("converts vori + ana + roti to decimal vori", () => {
    // 7 vori 0 ana 0 roti = 7
    expect(toTotalVori(7, 0, 0)).toBe(7);
    // 7 vori 8 ana 0 roti = 7.5
    expect(toTotalVori(7, 8, 0)).toBe(7.5);
    // 0 vori 16 ana 0 roti = 1
    expect(toTotalVori(0, 16, 0)).toBe(1);
    // 1 vori 0 ana 96 roti = 1 + 96/96 = 2
    expect(toTotalVori(1, 0, 96)).toBe(2);
  });
});
