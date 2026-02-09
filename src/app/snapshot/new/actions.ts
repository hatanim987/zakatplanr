"use server";

import { db } from "@/db";
import { assetSnapshots, hawlCycles } from "@/db/schema";
import { getTrackingCycle } from "@/db/queries";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  calculateNisabValues,
  calculateTotalWealth,
  getNisabThreshold,
  isNisabMet,
  voriToGram,
} from "@/lib/zakat";
import { toHijri, formatHijriShort, calculateHawlDueDate } from "@/lib/hijri";
import { isHawlComplete } from "@/lib/hawl";
import { transitionTrackingToDue } from "@/lib/hawl-transitions";

export type SnapshotFormState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function createSnapshot(
  _prevState: SnapshotFormState,
  formData: FormData
): Promise<SnapshotFormState> {
  const snapshotDate = formData.get("snapshotDate") as string;
  const goldPriceStr = formData.get("goldPrice") as string;
  const silverPriceStr = formData.get("silverPrice") as string;
  const goldValueStr = formData.get("gold") as string;
  const silverValueStr = formData.get("silver") as string;
  const goldVoriStr = formData.get("goldVoriTotal") as string;
  const silverVoriStr = formData.get("silverVoriTotal") as string;
  const currency = (formData.get("currency") as string) || "BDT";
  const notes = formData.get("notes") as string;

  const errors: Record<string, string> = {};

  if (!snapshotDate) errors.snapshotDate = "Date is required";

  const goldPrice = parseFloat(goldPriceStr) || 0;
  const silverPrice = parseFloat(silverPriceStr) || 0;
  if (goldPrice <= 0 && silverPrice <= 0) {
    errors.goldPrice = "At least one metal price is required";
  }

  if (Object.keys(errors).length > 0) return { errors };

  // Parse asset values
  const cashAndBank = parseFloat(formData.get("cashAndBank") as string) || 0;
  const goldValue = parseFloat(goldValueStr) || 0;
  const silverValue = parseFloat(silverValueStr) || 0;
  const businessAssets = parseFloat(formData.get("businessAssets") as string) || 0;
  const stocks = parseFloat(formData.get("stocks") as string) || 0;
  const otherInvestments = parseFloat(formData.get("otherInvestments") as string) || 0;
  const receivables = parseFloat(formData.get("receivables") as string) || 0;
  const liabilities = parseFloat(formData.get("liabilities") as string) || 0;

  const assets = {
    cashAndBank,
    gold: goldValue,
    silver: silverValue,
    businessAssets,
    stocks,
    otherInvestments,
    receivables,
    liabilities,
  };

  // Calculate
  const gpGram = goldPrice > 0 ? voriToGram(goldPrice) : undefined;
  const spGram = silverPrice > 0 ? voriToGram(silverPrice) : undefined;
  const totalWealth = calculateTotalWealth(assets);
  const nisab = calculateNisabValues(gpGram, spGram);
  const nisabThreshold = getNisabThreshold(nisab.goldNisab, nisab.silverNisab);
  const nisabMet = nisabThreshold ? isNisabMet(totalWealth, nisabThreshold) : false;

  // Insert snapshot
  const [snapshot] = await db
    .insert(assetSnapshots)
    .values({
      cashAndBank: cashAndBank.toString(),
      gold: goldValue.toString(),
      silver: silverValue.toString(),
      businessAssets: businessAssets.toString(),
      stocks: stocks.toString(),
      otherInvestments: otherInvestments.toString(),
      receivables: receivables.toString(),
      liabilities: liabilities.toString(),
      goldPricePerVori: goldPrice > 0 ? goldPrice.toString() : null,
      silverPricePerVori: silverPrice > 0 ? silverPrice.toString() : null,
      goldVori: goldVoriStr || null,
      silverVori: silverVoriStr || null,
      totalWealth: totalWealth.toString(),
      nisabThreshold: (nisabThreshold ?? 0).toString(),
      nisabMet,
      currency,
      notes: notes?.trim() || null,
      snapshotDate: new Date(snapshotDate),
    })
    .returning();

  // ── Hawl state transitions ──
  const trackingCycle = await getTrackingCycle();

  if (nisabMet) {
    if (!trackingCycle) {
      // No active tracking — start new Hawl cycle
      const startDate = new Date(snapshotDate);
      const startHijri = toHijri(startDate);
      const due = calculateHawlDueDate(startDate);

      await db.insert(hawlCycles).values({
        status: "tracking",
        startSnapshotId: snapshot.id,
        hawlStartDate: startDate,
        hawlStartHijri: formatHijriShort(startHijri),
        hawlDueDate: due.gregorian,
        hawlDueHijri: formatHijriShort(due.hijri),
        currency,
      });
    } else {
      const snapshotTime = new Date(snapshotDate);

      // If this snapshot is earlier than the cycle start, backdate the Hawl
      if (snapshotTime < trackingCycle.hawlStartDate) {
        const newStartHijri = toHijri(snapshotTime);
        const newDue = calculateHawlDueDate(snapshotTime);
        await db
          .update(hawlCycles)
          .set({
            startSnapshotId: snapshot.id,
            hawlStartDate: snapshotTime,
            hawlStartHijri: formatHijriShort(newStartHijri),
            hawlDueDate: newDue.gregorian,
            hawlDueHijri: formatHijriShort(newDue.hijri),
            updatedAt: new Date(),
          })
          .where(eq(hawlCycles.id, trackingCycle.id));
      }

      // Check if Hawl is now complete (use the potentially updated due date)
      const dueDate = (snapshotTime < trackingCycle.hawlStartDate)
        ? calculateHawlDueDate(snapshotTime).gregorian
        : trackingCycle.hawlDueDate;

      if (isHawlComplete(dueDate, snapshotTime)) {
        // Transition to due + auto-create next tracking cycle
        await transitionTrackingToDue(trackingCycle, snapshot);
      }
      // Otherwise no change — cycle continues
    }
  } else {
    // Below Nisab
    if (trackingCycle) {
      // Reset the tracking cycle (due cycles are unaffected)
      await db
        .update(hawlCycles)
        .set({
          status: "reset",
          resetSnapshotId: snapshot.id,
          endDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(hawlCycles.id, trackingCycle.id));
    }
    // Due cycles unaffected — obligation stands (fiqh)
  }

  revalidatePath("/");
  revalidatePath("/hawl");
  revalidatePath("/snapshot");
  redirect("/");
}
