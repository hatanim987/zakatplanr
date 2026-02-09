"use server";

import { db } from "@/db";
import { zakatPayments, hawlCycles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getHawlCycleById, getHawlPaymentSummary } from "@/db/queries";

export type PaymentFormState = {
  errors?: Record<string, string>;
  success?: boolean;
};

export async function addHawlPayment(
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const hawlCycleId = formData.get("hawlCycleId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const recipient = formData.get("recipient") as string;
  const category = formData.get("category") as string;
  const date = formData.get("date") as string;
  const notes = formData.get("notes") as string;

  const errors: Record<string, string> = {};

  if (!amount || amount <= 0) errors.amount = "Amount must be greater than 0";
  if (!recipient?.trim()) errors.recipient = "Recipient is required";
  if (!category) errors.category = "Category is required";
  if (!date) errors.date = "Date is required";

  if (Object.keys(errors).length > 0) return { errors };

  const cycle = await getHawlCycleById(hawlCycleId);
  if (!cycle) return { errors: { amount: "Hawl cycle not found" } };

  const summary = await getHawlPaymentSummary(hawlCycleId);
  const zakatAmount = parseFloat(cycle.zakatAmount ?? "0");
  const remaining = zakatAmount - parseFloat(summary.totalPaid);

  if (amount > remaining + 0.01) {
    return {
      errors: {
        amount: `Amount exceeds remaining (${remaining.toFixed(2)})`,
      },
    };
  }

  await db.insert(zakatPayments).values({
    hawlCycleId,
    amount: amount.toString(),
    recipient: recipient.trim(),
    category,
    date: new Date(date),
    notes: notes?.trim() || null,
  });

  // Check if fully paid
  const newSummary = await getHawlPaymentSummary(hawlCycleId);
  const newTotalPaid = parseFloat(newSummary.totalPaid);

  if (newTotalPaid >= zakatAmount) {
    // Mark cycle as paid (tracking cycle was already created at due-transition)
    await db
      .update(hawlCycles)
      .set({
        status: "paid",
        endDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(hawlCycles.id, hawlCycleId));
  }

  revalidatePath(`/hawl/${hawlCycleId}`);
  revalidatePath("/hawl");
  revalidatePath("/");

  return { success: true };
}

export async function deleteHawlPayment(
  paymentId: string,
  hawlCycleId: string
) {
  await db.delete(zakatPayments).where(eq(zakatPayments.id, paymentId));

  // If cycle was "paid", revert to "due" since payment was removed
  const cycle = await getHawlCycleById(hawlCycleId);
  if (cycle && cycle.status === "paid") {
    const summary = await getHawlPaymentSummary(hawlCycleId);
    const zakatAmount = parseFloat(cycle.zakatAmount ?? "0");
    const totalPaid = parseFloat(summary.totalPaid);

    if (totalPaid < zakatAmount) {
      await db
        .update(hawlCycles)
        .set({
          status: "due",
          endDate: null,
          updatedAt: new Date(),
        })
        .where(eq(hawlCycles.id, hawlCycleId));
    }
  }

  revalidatePath(`/hawl/${hawlCycleId}`);
  revalidatePath("/hawl");
  revalidatePath("/");
}
