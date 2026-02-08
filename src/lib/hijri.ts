import { gregorianToHijri, hijriToGregorian } from "@tabby_ai/hijri-converter";

export interface HijriDate {
  year: number;
  month: number;
  day: number;
}

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Ula",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhul Qi'dah",
  "Dhul Hijjah",
] as const;

export function toHijri(date: Date): HijriDate {
  return gregorianToHijri({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
}

export function toGregorian(hijri: HijriDate): Date {
  const g = hijriToGregorian({
    year: hijri.year,
    month: hijri.month,
    day: hijri.day,
  });
  return new Date(g.year, g.month - 1, g.day);
}

export function formatHijri(hijri: HijriDate): string {
  const monthName = HIJRI_MONTHS[hijri.month - 1];
  return `${hijri.day} ${monthName} ${hijri.year}`;
}

export function formatHijriShort(hijri: HijriDate): string {
  const m = String(hijri.month).padStart(2, "0");
  const d = String(hijri.day).padStart(2, "0");
  return `${hijri.year}-${m}-${d}`;
}

export function parseHijriShort(str: string): HijriDate {
  const [year, month, day] = str.split("-").map(Number);
  return { year, month, day };
}

export function addHijriMonths(hijri: HijriDate, months: number): HijriDate {
  let newMonth = hijri.month + months;
  let newYear = hijri.year;

  while (newMonth > 12) {
    newMonth -= 12;
    newYear += 1;
  }
  while (newMonth < 1) {
    newMonth += 12;
    newYear -= 1;
  }

  // Clamp day — Hijri months have 29 or 30 days.
  // Try the original day first; if conversion fails, try day 29.
  let day = hijri.day;
  try {
    hijriToGregorian({ year: newYear, month: newMonth, day });
  } catch {
    day = 29;
  }

  return { year: newYear, month: newMonth, day };
}

export function calculateHawlDueDate(startDate: Date): {
  gregorian: Date;
  hijri: HijriDate;
} {
  const startHijri = toHijri(startDate);
  const dueHijri = addHijriMonths(startHijri, 12);
  const dueGregorian = toGregorian(dueHijri);
  return { gregorian: dueGregorian, hijri: dueHijri };
}
