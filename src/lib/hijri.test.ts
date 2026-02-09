import { describe, it, expect } from "vitest";
import {
  toHijri,
  toGregorian,
  formatHijri,
  formatHijriShort,
  parseHijriShort,
  addHijriMonths,
  calculateHawlDueDate,
} from "./hijri";

describe("toHijri", () => {
  it("converts a known Gregorian date to Hijri", () => {
    // Dec 13, 2024 = 12 Jumada al-Thani 1446
    const result = toHijri(new Date(2024, 11, 13));
    expect(result.year).toBe(1446);
    expect(result.month).toBe(6);
    expect(result.day).toBe(12);
  });
});

describe("toGregorian", () => {
  it("converts a known Hijri date to Gregorian", () => {
    const result = toGregorian({ year: 1446, month: 6, day: 12 });
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(11); // December = 11
    expect(result.getDate()).toBe(13);
  });

  it("round-trips with toHijri", () => {
    const original = new Date(2025, 5, 15); // Jun 15, 2025
    const hijri = toHijri(original);
    const back = toGregorian(hijri);
    expect(back.getFullYear()).toBe(original.getFullYear());
    expect(back.getMonth()).toBe(original.getMonth());
    expect(back.getDate()).toBe(original.getDate());
  });
});

describe("formatHijri", () => {
  it("formats with month name", () => {
    expect(formatHijri({ year: 1446, month: 6, day: 12 })).toBe(
      "12 Jumada al-Thani 1446"
    );
  });

  it("formats Muharram correctly", () => {
    expect(formatHijri({ year: 1447, month: 1, day: 1 })).toBe(
      "1 Muharram 1447"
    );
  });

  it("formats Dhul Hijjah correctly", () => {
    expect(formatHijri({ year: 1446, month: 12, day: 10 })).toBe(
      "10 Dhul Hijjah 1446"
    );
  });
});

describe("formatHijriShort", () => {
  it("formats as YYYY-MM-DD with padding", () => {
    expect(formatHijriShort({ year: 1446, month: 6, day: 12 })).toBe(
      "1446-06-12"
    );
    expect(formatHijriShort({ year: 1447, month: 1, day: 1 })).toBe(
      "1447-01-01"
    );
  });
});

describe("parseHijriShort", () => {
  it("parses YYYY-MM-DD string to HijriDate", () => {
    const result = parseHijriShort("1446-06-12");
    expect(result).toEqual({ year: 1446, month: 6, day: 12 });
  });

  it("round-trips with formatHijriShort", () => {
    const original = { year: 1447, month: 8, day: 15 };
    expect(parseHijriShort(formatHijriShort(original))).toEqual(original);
  });
});

describe("addHijriMonths", () => {
  it("adds months within the same year", () => {
    const result = addHijriMonths({ year: 1446, month: 1, day: 10 }, 5);
    expect(result.year).toBe(1446);
    expect(result.month).toBe(6);
    expect(result.day).toBe(10);
  });

  it("rolls over to the next year", () => {
    const result = addHijriMonths({ year: 1446, month: 10, day: 5 }, 5);
    expect(result.year).toBe(1447);
    expect(result.month).toBe(3);
    expect(result.day).toBe(5);
  });

  it("adds 12 months = next year same month", () => {
    const result = addHijriMonths({ year: 1446, month: 6, day: 12 }, 12);
    expect(result.year).toBe(1447);
    expect(result.month).toBe(6);
    expect(result.day).toBe(12);
  });

  it("clamps day to 29 when month has fewer days", () => {
    // Day 30 in a month that may only have 29 days
    const result = addHijriMonths({ year: 1446, month: 1, day: 30 }, 1);
    expect(result.day).toBeLessThanOrEqual(30);
    expect(result.day).toBeGreaterThanOrEqual(29);
  });
});

describe("calculateHawlDueDate", () => {
  it("returns a date approximately 354-355 days later", () => {
    const start = new Date(2024, 11, 13); // Dec 13, 2024
    const result = calculateHawlDueDate(start);

    // Due date should be roughly 354-356 days later
    const diffDays = Math.round(
      (result.gregorian.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(diffDays).toBeGreaterThanOrEqual(353);
    expect(diffDays).toBeLessThanOrEqual(356);
  });

  it("returns Hijri date exactly 12 months after start", () => {
    const start = new Date(2024, 11, 13); // Dec 13, 2024
    const startHijri = toHijri(start);
    const result = calculateHawlDueDate(start);

    expect(result.hijri.year).toBe(startHijri.year + 1);
    expect(result.hijri.month).toBe(startHijri.month);
    expect(result.hijri.day).toBe(startHijri.day);
  });

  it("handles start dates at end of Hijri year", () => {
    // Pick a date in Dhul Hijjah
    const start = new Date(2025, 5, 15); // Some date in mid-2025
    const result = calculateHawlDueDate(start);

    // Should still return a valid future date
    expect(result.gregorian.getTime()).toBeGreaterThan(start.getTime());
    expect(result.hijri.year).toBeGreaterThan(0);
  });
});
