"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addPayment, type PaymentFormState } from "./actions";
import { PAYMENT_CATEGORIES } from "@/lib/zakat";
import { formatCurrency } from "@/lib/format";
import { Plus } from "lucide-react";

const initialState: PaymentFormState = {};

export function AddPaymentDialog({
  periodId,
  remainingAmount,
  currency,
}: {
  periodId: string;
  remainingAmount: number;
  currency: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    addPayment,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Remaining: {formatCurrency(remainingAmount, currency)}
          </p>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="periodId" value={periodId} />

          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ৳
              </span>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                max={remainingAmount}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
            {state.errors?.amount && (
              <p className="text-sm text-destructive">{state.errors.amount}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              name="recipient"
              placeholder="Who received this payment?"
            />
            {state.errors?.recipient && (
              <p className="text-sm text-destructive">
                {state.errors.recipient}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select name="category">
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.category && (
              <p className="text-sm text-destructive">
                {state.errors.category}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" defaultValue={today} />
            {state.errors?.date && (
              <p className="text-sm text-destructive">{state.errors.date}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" name="notes" placeholder="Any notes..." />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Recording..." : "Record Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
