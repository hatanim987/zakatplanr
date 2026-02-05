import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PeriodCard } from "@/components/period-card";
import { getAllPeriodsWithSummary } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function PeriodsPage() {
  const periods = await getAllPeriodsWithSummary();

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Zakat Periods
            </h2>
            <p className="mt-1 text-muted-foreground">
              Track your Zakat distribution across periods.
            </p>
          </div>
          <Link href="/calculate">
            <Button>New Period</Button>
          </Link>
        </div>

        {periods.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <h3 className="text-lg font-semibold">No periods yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Calculate your Zakat to create your first period.
            </p>
            <Link href="/calculate" className="mt-4">
              <Button>Calculate Zakat</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {periods.map((period) => (
              <PeriodCard
                key={period.id}
                id={period.id}
                name={period.name}
                startDate={period.startDate}
                endDate={period.endDate}
                zakatAmount={period.zakatAmount}
                totalPaid={period.totalPaid}
                isManualEntry={period.isManualEntry}
                currency={period.currency}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
