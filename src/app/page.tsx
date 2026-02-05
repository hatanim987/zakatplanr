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
import { ZakatProgress } from "@/components/zakat-progress";
import { getLatestPeriod, getPaymentSummary, getRecentPayments } from "@/db/queries";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function Home() {
  let latestPeriod = null;
  let summary = null;
  let recentPayments: Awaited<ReturnType<typeof getRecentPayments>> = [];

  try {
    latestPeriod = await getLatestPeriod();
    if (latestPeriod) {
      summary = await getPaymentSummary(latestPeriod.id);
      recentPayments = await getRecentPayments(5);
    }
  } catch {
    // DB not connected yet — show static landing
  }

  const zakatAmount = latestPeriod ? parseFloat(latestPeriod.zakatAmount) : 0;
  const totalPaid = summary ? parseFloat(summary.totalPaid) : 0;
  const remaining = Math.max(0, zakatAmount - totalPaid);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">ZakatPlanr</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            Zakat Made Simple
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Calculate your Zakat and track distributions throughout the year.
          </p>
        </div>

        {/* Current Period Summary */}
        {latestPeriod && summary && (
          <div className="mx-auto mb-8 max-w-3xl">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Current Period: {latestPeriod.name}</CardTitle>
                    <CardDescription>
                      {formatCurrency(zakatAmount, latestPeriod.currency)} total
                      Zakat due
                    </CardDescription>
                  </div>
                  {remaining <= 0 && (
                    <Badge className="bg-green-600">Complete</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ZakatProgress
                  total={zakatAmount}
                  paid={totalPaid}
                  currency={latestPeriod.currency}
                />
                <div className="flex justify-end">
                  <Link href={`/periods/${latestPeriod.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Payments */}
        {recentPayments.length > 0 && (
          <div className="mx-auto mb-8 max-w-3xl">
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
                {recentPayments.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex justify-end">
                      <Link href="/periods">
                        <Button variant="ghost" size="sm">
                          View All Periods
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Cards */}
        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Calculate Zakat</CardTitle>
              <CardDescription>
                Enter your wealth details and let us calculate the Zakat amount
                based on Islamic Shariah.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/calculate">
                <Button className="w-full">Start Calculation</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Track Distributions</CardTitle>
              <CardDescription>
                Already know your amount? Enter it directly and track your
                payments throughout the year.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/periods">
                <Button variant="outline" className="w-full">
                  View Periods
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
