export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppHeader } from "@/components/app-header";
import { HawlStatusBadge } from "@/components/hawl-status-badge";
import { ZakatProgress } from "@/components/zakat-progress";
import {
  getHawlCycleById,
  getPaymentsByHawlCycleId,
  getHawlPaymentSummary,
  getSnapshotsByDateRange,
} from "@/db/queries";
import { formatCurrency, formatDate, formatDateDual } from "@/lib/format";
import { calculateDaysElapsed } from "@/lib/hawl";
import type { HawlStatus } from "@/lib/hawl";
import { ArrowLeft } from "lucide-react";
import { AddPaymentDialog } from "./add-payment-dialog";
import { PaymentList } from "./payment-list";
import { requireUserId } from "@/lib/auth-utils";

export default async function HawlDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;

  const cycle = await getHawlCycleById(userId, id);
  if (!cycle) notFound();

  const payments = await getPaymentsByHawlCycleId(userId, id);
  const summary = await getHawlPaymentSummary(userId, id);

  const zakatAmount = parseFloat(cycle.zakatAmount ?? "0");
  const totalPaid = parseFloat(summary.totalPaid);
  const remaining = Math.max(0, zakatAmount - totalPaid);
  const isComplete = remaining <= 0 && zakatAmount > 0;
  const status = cycle.status as HawlStatus;

  // Get snapshots during this cycle
  const endDate = cycle.endDate ?? new Date();
  const snapshots = await getSnapshotsByDateRange(userId, cycle.hawlStartDate, endDate);

  const totalDays = calculateDaysElapsed(cycle.hawlStartDate, cycle.hawlDueDate);
  const daysElapsed = Math.min(
    calculateDaysElapsed(cycle.hawlStartDate, new Date()),
    totalDays
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <Link
          href="/hawl"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Hawl History
        </Link>

        {/* Cycle Summary */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Hawl Cycle</CardTitle>
              <div className="flex items-center gap-2">
                {isComplete && (
                  <Badge className="bg-green-600">Complete</Badge>
                )}
                <HawlStatusBadge status={status} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="font-medium">
                  {formatDateDual(cycle.hawlStartDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">
                  {formatDateDual(cycle.hawlDueDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days</p>
                <p className="font-medium">
                  {daysElapsed} of {totalDays} days
                </p>
              </div>
              {cycle.endDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Ended</p>
                  <p className="font-medium">{formatDate(cycle.endDate)}</p>
                </div>
              )}
            </div>

            {zakatAmount > 0 && (
              <>
                <Separator />
                <ZakatProgress
                  total={zakatAmount}
                  paid={totalPaid}
                  currency={cycle.currency}
                />
              </>
            )}

            {cycle.wealthAtDue && (
              <div className="mt-2 rounded-md bg-primary/10 p-3">
                <p className="text-sm text-muted-foreground">
                  Wealth when Zakat became due
                </p>
                <p className="text-lg font-semibold">
                  {formatCurrency(cycle.wealthAtDue, cycle.currency)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Snapshots Timeline */}
        {snapshots.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                Asset Snapshots ({snapshots.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {formatDate(snap.snapshotDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Wealth: {formatCurrency(snap.totalWealth, snap.currency)}
                      </p>
                    </div>
                    <Badge
                      variant={snap.nisabMet ? "default" : "destructive"}
                      className={snap.nisabMet ? "bg-green-600" : ""}
                    >
                      {snap.nisabMet ? "Above Nisab" : "Below Nisab"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Payments ({summary.paymentCount})
          </h3>
          {status === "due" && remaining > 0 && (
            <AddPaymentDialog
              hawlCycleId={id}
              remainingAmount={remaining}
              currency={cycle.currency}
            />
          )}
        </div>

        {payments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">
                {status === "due"
                  ? "No payments recorded yet. Start distributing your Zakat."
                  : "No payments for this cycle."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <PaymentList
            payments={payments}
            hawlCycleId={id}
            currency={cycle.currency}
          />
        )}
      </main>
    </div>
  );
}
