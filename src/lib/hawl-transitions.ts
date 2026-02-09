import { db } from "@/db";
import { hawlCycles } from "@/db/schema";
import type { HawlCycle, AssetSnapshot } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTrackingCycle } from "@/db/queries";
import { calculateZakat } from "@/lib/zakat";
import { toHijri, formatHijriShort, calculateHawlDueDate } from "@/lib/hijri";

/**
 * Transitions a "tracking" cycle to "due" and auto-creates a new "tracking" cycle
 * starting from the previous cycle's due date (continuous, no gap).
 *
 * Used by both dashboard auto-transition and snapshot creation.
 */
export async function transitionTrackingToDue(
  trackingCycle: HawlCycle,
  latestSnapshot: AssetSnapshot
): Promise<{ dueCycleId: string; newTrackingCycleId: string | null }> {
  const totalWealth = parseFloat(latestSnapshot.totalWealth);
  const zakatAmount = calculateZakat(totalWealth);

  // 1. Mark tracking cycle as "due"
  await db
    .update(hawlCycles)
    .set({
      status: "due",
      zakatAmount: zakatAmount.toString(),
      wealthAtDue: totalWealth.toString(),
      updatedAt: new Date(),
    })
    .where(eq(hawlCycles.id, trackingCycle.id));

  // 2. Create new tracking cycle starting from the due date (continuous)
  // Guard: only create if no tracking cycle already exists (prevents duplicates from race conditions)
  let newTrackingCycleId: string | null = null;
  if (latestSnapshot.nisabMet) {
    const existing = await getTrackingCycle();
    if (!existing) {
      const startDate = trackingCycle.hawlDueDate;
      const startHijri = toHijri(startDate);
      const due = calculateHawlDueDate(startDate);

      const [newCycle] = await db
        .insert(hawlCycles)
        .values({
          status: "tracking",
          startSnapshotId: latestSnapshot.id,
          hawlStartDate: startDate,
          hawlStartHijri: formatHijriShort(startHijri),
          hawlDueDate: due.gregorian,
          hawlDueHijri: formatHijriShort(due.hijri),
          currency: latestSnapshot.currency,
        })
        .returning();

      newTrackingCycleId = newCycle.id;
    } else {
      newTrackingCycleId = existing.id;
    }
  }

  return { dueCycleId: trackingCycle.id, newTrackingCycleId };
}
