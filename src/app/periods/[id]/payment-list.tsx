"use client";

import { useTransition } from "react";
import { PaymentCard } from "@/components/payment-card";
import { deletePayment } from "./actions";
import type { ZakatPayment } from "@/db/schema";

export function PaymentList({
  payments,
  periodId,
  currency,
}: {
  payments: ZakatPayment[];
  periodId: string;
  currency: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(paymentId: string) {
    if (!confirm("Delete this payment?")) return;
    startTransition(() => {
      deletePayment(paymentId, periodId);
    });
  }

  return (
    <div className={`space-y-3 ${isPending ? "opacity-60" : ""}`}>
      {payments.map((payment) => (
        <PaymentCard
          key={payment.id}
          id={payment.id}
          amount={payment.amount}
          recipient={payment.recipient}
          category={payment.category}
          date={payment.date}
          notes={payment.notes}
          currency={currency}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
