import type { HawlCycle, AssetSnapshot } from "@/db/schema";
import type { HijriDate } from "./hijri";
import { parseHijriShort } from "./hijri";

export const HAWL_LUNAR_MONTHS = 12;
export const STALE_DAYS = 30;

export type HawlStatus = "idle" | "tracking" | "due" | "paid" | "reset";

export interface HawlState {
  status: HawlStatus;
  cycleId: string | null;
  hawlStartDate: Date | null;
  hawlStartHijri: HijriDate | null;
  hawlDueDate: Date | null;
  hawlDueHijri: HijriDate | null;
  daysElapsed: number;
  daysRemaining: number;
  totalDays: number;
  progressPercent: number;
  zakatAmount: number | null;
  lastSnapshotDate: Date | null;
  isStale: boolean;
}

export function calculateDaysElapsed(startDate: Date, now: Date = new Date()): number {
  const diffMs = now.getTime() - startDate.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function isHawlComplete(dueDate: Date, now: Date = new Date()): boolean {
  return now >= dueDate;
}

export function isSnapshotStale(
  snapshotDate: Date,
  staleDays: number = STALE_DAYS
): boolean {
  const diffMs = Date.now() - snapshotDate.getTime();
  const daysDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return daysDiff >= staleDays;
}

export function computeHawlState(
  activeCycle: HawlCycle | null | undefined,
  latestSnapshot: AssetSnapshot | null | undefined
): HawlState {
  const now = new Date();

  const baseState: HawlState = {
    status: "idle",
    cycleId: null,
    hawlStartDate: null,
    hawlStartHijri: null,
    hawlDueDate: null,
    hawlDueHijri: null,
    daysElapsed: 0,
    daysRemaining: 0,
    totalDays: 0,
    progressPercent: 0,
    zakatAmount: null,
    lastSnapshotDate: latestSnapshot ? latestSnapshot.snapshotDate : null,
    isStale: latestSnapshot
      ? isSnapshotStale(latestSnapshot.snapshotDate)
      : true,
  };

  if (!activeCycle) return baseState;

  const status = activeCycle.status as HawlStatus;
  const startDate = activeCycle.hawlStartDate;
  const dueDate = activeCycle.hawlDueDate;
  const totalDays = calculateDaysElapsed(startDate, dueDate);
  const daysElapsed = Math.min(
    calculateDaysElapsed(startDate, now),
    totalDays
  );
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const progressPercent = totalDays > 0
    ? Math.min(100, Math.round((daysElapsed / totalDays) * 100))
    : 0;

  return {
    ...baseState,
    status,
    cycleId: activeCycle.id,
    hawlStartDate: startDate,
    hawlStartHijri: parseHijriShort(activeCycle.hawlStartHijri),
    hawlDueDate: dueDate,
    hawlDueHijri: parseHijriShort(activeCycle.hawlDueHijri),
    daysElapsed,
    daysRemaining,
    totalDays,
    progressPercent,
    zakatAmount: activeCycle.zakatAmount
      ? parseFloat(activeCycle.zakatAmount)
      : null,
  };
}
