export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ZakatProgress } from "@/components/zakat-progress";
import { getPeriodById, getPaymentsByPeriodId, getPaymentSummary } from "@/db/queries";
import { formatCurrency, formatDate, formatDateRange } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import { AddPaymentDialog } from "./add-payment-dialog";
import { PaymentList } from "./payment-list";

export default async function PeriodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const period = await getPeriodById(id);
  if (!period) notFound();

  const payments = await getPaymentsByPeriodId(id);
  const summary = await getPaymentSummary(id);

  const totalPaid = parseFloat(summary.totalPaid);
  const zakatAmount = parseFloat(period.zakatAmount);
  const remaining = Math.max(0, zakatAmount - totalPaid);
  const isComplete = remaining <= 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            ZakatPlanr
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/periods"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Periods
        </Link>

        {/* Summary Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{period.name}</CardTitle>
                <CardDescription>
                  {formatDateRange(period.startDate, period.endDate)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isComplete && <Badge className="bg-green-600">Complete</Badge>}
                {period.isManualEntry && (
                  <Badge variant="secondary">Manual Entry</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ZakatProgress
              total={zakatAmount}
              paid={totalPaid}
              currency={period.currency}
            />

            {/* Wealth Breakdown (only for calculated periods) */}
            {!period.isManualEntry && period.totalWealth && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                    Wealth Breakdown
                  </h4>
                  <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    {period.cashAndBank && parseFloat(period.cashAndBank) > 0 && (
                      <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
                        <span>Cash & Bank</span>
                        <span className="font-medium">
                          {formatCurrency(period.cashAndBank, period.currency)}
                        </span>
                      </div>
                    )}
                    {period.gold && parseFloat(period.gold) > 0 && (
                      <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
                        <span>Gold</span>
                        <span className="font-medium">
                          {formatCurrency(period.gold, period.currency)}
                        </span>
                      </div>
                    )}
                    {period.silver && parseFloat(period.silver) > 0 && (
                      <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
                        <span>Silver</span>
                        <span className="font-medium">
                          {formatCurrency(period.silver, period.currency)}
                        </span>
                      </div>
                    )}
                    {period.businessAssets &&
                      parseFloat(period.businessAssets) > 0 && (
                        <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
                          <span>Business</span>
                          <span className="font-medium">
                            {formatCurrency(
                              period.businessAssets,
                              period.currency
                            )}
                          </span>
                        </div>
                      )}
                    {period.stocks && parseFloat(period.stocks) > 0 && (
                      <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
                        <span>Stocks</span>
                        <span className="font-medium">
                          {formatCurrency(period.stocks, period.currency)}
                        </span>
                      </div>
                    )}
                    {period.otherInvestments &&
                      parseFloat(period.otherInvestments) > 0 && (
                        <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
                          <span>Other Investments</span>
                          <span className="font-medium">
                            {formatCurrency(
                              period.otherInvestments,
                              period.currency
                            )}
                          </span>
                        </div>
                      )}
                    {period.receivables &&
                      parseFloat(period.receivables) > 0 && (
                        <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
                          <span>Receivables</span>
                          <span className="font-medium">
                            {formatCurrency(
                              period.receivables,
                              period.currency
                            )}
                          </span>
                        </div>
                      )}
                    {period.liabilities &&
                      parseFloat(period.liabilities) > 0 && (
                        <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
                          <span>Liabilities</span>
                          <span className="font-medium text-destructive">
                            -{formatCurrency(
                              period.liabilities,
                              period.currency
                            )}
                          </span>
                        </div>
                      )}
                  </div>
                  <div className="mt-3 flex justify-between rounded-md bg-primary/10 px-3 py-2 text-sm font-medium">
                    <span>Net Zakatable Wealth</span>
                    <span>
                      {formatCurrency(period.totalWealth!, period.currency)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {period.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                    Notes
                  </h4>
                  <p className="text-sm">{period.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payments Section */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            Payments ({summary.paymentCount})
          </h3>
          {!isComplete && (
            <AddPaymentDialog
              periodId={id}
              remainingAmount={remaining}
              currency={period.currency}
            />
          )}
        </div>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No payments recorded yet. Start distributing your Zakat.
            </p>
          </div>
        ) : (
          <PaymentList
            payments={payments}
            periodId={id}
            currency={period.currency}
          />
        )}
      </main>
    </div>
  );
}
