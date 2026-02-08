import { toHijri, formatHijri } from "./hijri";

export function formatCurrency(
  amount: number | string,
  currency: string = "BDT"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${currency} 0.00`;

  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (currency === "BDT") return `৳${formatted}`;
  return `${currency} ${formatted}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateDual(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const gregorian = formatDate(d);
  const hijri = formatHijri(toHijri(d));
  return `${gregorian} / ${hijri}`;
}

export function formatDateRange(
  start: Date | string,
  end: Date | string
): string {
  return `${formatDate(start)} — ${formatDate(end)}`;
}
