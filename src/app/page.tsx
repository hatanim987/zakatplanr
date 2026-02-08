export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppHeader } from "@/components/app-header";
import { HawlProgressRing } from "@/components/hawl-progress-ring";
import { HawlStatusBadge } from "@/components/hawl-status-badge";
import { StaleReminder } from "@/components/stale-reminder";
import { ZakatProgress } from "@/components/zakat-progress";
import {
  getActiveHawlCycle,
  getLatestSnapshot,
  getRecentPayments,
  getHawlPaymentSummary,
} from "@/db/queries";
import { hawlCycles } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { computeHawlState, isHawlComplete } from "@/lib/hawl";
import { calculateZakat } from "@/lib/zakat";
import { formatCurrency, formatDate, formatDateDual } from "@/lib/format";

export default async function Home() {
  let activeCycle = null;
  let latestSnapshot = null;
  let recentPayments: Awaited<ReturnType<typeof getRecentPayments>> = [];
  let paymentSummary = { totalPaid: "0", paymentCount: 0 };

  try {
    activeCycle = (await getActiveHawlCycle()) ?? null;
    latestSnapshot = (await getLatestSnapshot()) ?? null;

    // Auto-transition: if tracking and due date has passed
    if (activeCycle && activeCycle.status === "tracking" && latestSnapshot) {
      if (isHawlComplete(activeCycle.hawlDueDate)) {
        const totalWealth = parseFloat(latestSnapshot.totalWealth);
        const zakatAmount = calculateZakat(totalWealth);
        await db
          .update(hawlCycles)
          .set({
            status: "due",
            zakatAmount: zakatAmount.toString(),
            wealthAtDue: totalWealth.toString(),
            updatedAt: new Date(),
          })
          .where(eq(hawlCycles.id, activeCycle.id));
        activeCycle = (await getActiveHawlCycle()) ?? null;
      }
    }

    if (activeCycle) {
      paymentSummary = await getHawlPaymentSummary(activeCycle.id);
      recentPayments = await getRecentPayments(5);
    }
  } catch {
    // DB not connected yet
  }

  const hawlState = computeHawlState(activeCycle, latestSnapshot);
  const zakatAmount = hawlState.zakatAmount ?? 0;
  const totalPaid = parseFloat(paymentSummary.totalPaid);
  const remaining = Math.max(0, zakatAmount - totalPaid);
  const daysSinceUpdate = latestSnapshot
    ? Math.floor(
        (Date.now() - latestSnapshot.snapshotDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            Zakat Made Simple
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Track your wealth, monitor your Hawl, and distribute Zakat with
            confidence.
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-6">
          {/* Stale Reminder */}
          {latestSnapshot && hawlState.isStale && (
            <StaleReminder daysSinceUpdate={daysSinceUpdate} />
          )}

          {/* Idle State — No snapshots yet */}
          {hawlState.status === "idle" && (
            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Log your first asset snapshot to begin Hawl tracking. Zakat
                  becomes due after your wealth stays above Nisab for 12 lunar
                  months.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/snapshot/new">
                  <Button className="w-full">Log Your First Snapshot</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Hawl Progress */}
          {hawlState.status !== "idle" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Hawl Progress</CardTitle>
                  <HawlStatusBadge status={hawlState.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
                  <HawlProgressRing
                    percent={hawlState.progressPercent}
                    daysElapsed={hawlState.daysElapsed}
                    totalDays={hawlState.totalDays}
                    status={hawlState.status}
                  />
                  <div className="flex-1 space-y-3">
                    {hawlState.hawlStartDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Started</span>
                        <span>{formatDateDual(hawlState.hawlStartDate)}</span>
                      </div>
                    )}
                    {hawlState.hawlDueDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Due Date</span>
                        <span>{formatDateDual(hawlState.hawlDueDate)}</span>
                      </div>
                    )}
                    {hawlState.daysRemaining > 0 &&
                      hawlState.status === "tracking" && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Remaining
                          </span>
                          <span className="font-medium">
                            {hawlState.daysRemaining} days
                          </span>
                        </div>
                      )}
                    {hawlState.status === "due" && zakatAmount > 0 && (
                      <>
                        <Separator />
                        <ZakatProgress
                          total={zakatAmount}
                          paid={totalPaid}
                          currency="BDT"
                        />
                        {remaining > 0 && (
                          <Link href={`/hawl/${hawlState.cycleId}`}>
                            <Button size="sm" className="w-full">
                              Start Distributing
                            </Button>
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Wealth */}
          {latestSnapshot && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Current Wealth</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    Last updated: {formatDate(latestSnapshot.snapshotDate)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Wealth</span>
                  <span className="font-semibold">
                    {formatCurrency(latestSnapshot.totalWealth)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Nisab Threshold
                  </span>
                  <span>
                    {formatCurrency(latestSnapshot.nisabThreshold)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Above Nisab?</span>
                  <span
                    className={
                      latestSnapshot.nisabMet
                        ? "text-green-600 font-medium"
                        : "text-red-500 font-medium"
                    }
                  >
                    {latestSnapshot.nisabMet ? "Yes" : "No"}
                  </span>
                </div>
                {latestSnapshot.nisabMet && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Estimated Zakat (2.5%)
                    </span>
                    <span className="font-medium text-primary">
                      {formatCurrency(
                        calculateZakat(parseFloat(latestSnapshot.totalWealth))
                      )}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Payments */}
          {recentPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                        {payment.category && (
                          <Badge variant="secondary" className="text-xs">
                            {payment.category}
                          </Badge>
                        )}
                        {payment.recipient && (
                          <span className="text-muted-foreground">
                            to {payment.recipient}
                          </span>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {formatDate(payment.date)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-end">
                  <Link href="/hawl">
                    <Button variant="ghost" size="sm">
                      View Hawl History
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Update Assets</CardTitle>
                <CardDescription>
                  Log your current wealth to keep Hawl tracking accurate.
                  Update monthly for best results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/snapshot/new">
                  <Button className="w-full">Update Assets</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hawl History</CardTitle>
                <CardDescription>
                  View all Hawl cycles, track progress, and manage Zakat
                  distributions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/hawl">
                  <Button variant="outline" className="w-full">
                    View History
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
