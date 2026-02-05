"use server";

import { db } from "@/db";
import { zakatPayments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getPeriodById, getPaymentSummary } from "@/db/queries";

export type PaymentFormState = {
  errors?: Record<string, string>;
  success?: boolean;
};

export async function addPayment(
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const periodId = formData.get("periodId") as string;
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

  // Validate against remaining amount
  const period = await getPeriodById(periodId);
  if (!period) return { errors: { amount: "Period not found" } };

  const summary = await getPaymentSummary(periodId);
  const remaining =
    parseFloat(period.zakatAmount) - parseFloat(summary.totalPaid);

  if (amount > remaining) {
    return {
      errors: { amount: `Amount exceeds remaining (${remaining.toFixed(2)})` },
    };
  }

  await db.insert(zakatPayments).values({
    periodId,
    amount: amount.toString(),
    recipient: recipient.trim(),
    category,
    date: new Date(date),
    notes: notes?.trim() || null,
  });

  revalidatePath(`/periods/${periodId}`);
  revalidatePath("/periods");
  revalidatePath("/");

  return { success: true };
}

export async function deletePayment(paymentId: string, periodId: string) {
  await db.delete(zakatPayments).where(eq(zakatPayments.id, paymentId));

  revalidatePath(`/periods/${periodId}`);
  revalidatePath("/periods");
  revalidatePath("/");
}
