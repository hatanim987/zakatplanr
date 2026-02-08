export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppHeader } from "@/components/app-header";
import { HawlStatusBadge } from "@/components/hawl-status-badge";
import { ZakatProgress } from "@/components/zakat-progress";
import { getAllHawlCycles } from "@/db/queries";
import { formatCurrency, formatDate, formatDateDual } from "@/lib/format";
import type { HawlStatus } from "@/lib/hawl";

export default async function HawlHistoryPage() {
  let cycles: Awaited<ReturnType<typeof getAllHawlCycles>> = [];

  try {
    cycles = await getAllHawlCycles();
  } catch {
    // DB not connected
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Hawl History</h2>
            <p className="mt-1 text-muted-foreground">
              All your Hawl cycles and Zakat obligations.
            </p>
          </div>
          <Link href="/snapshot/new">
            <Button>Update Assets</Button>
          </Link>
        </div>

        {cycles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-muted-foreground">
                No Hawl cycles yet. Log your first asset snapshot to get
                started.
              </p>
              <Link href="/snapshot/new">
                <Button>Log First Snapshot</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cycles.map((cycle) => {
              const zakatAmount = cycle.zakatAmount
                ? parseFloat(cycle.zakatAmount)
                : 0;
              const totalPaid = parseFloat(cycle.totalPaid);

              return (
                <Link key={cycle.id} href={`/hawl/${cycle.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {formatDate(cycle.hawlStartDate)}
                        </CardTitle>
                        <HawlStatusBadge
                          status={cycle.status as HawlStatus}
                        />
                      </div>
                      <CardDescription>
                        Due: {formatDateDual(cycle.hawlDueDate)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {zakatAmount > 0 ? (
                        <ZakatProgress
                          total={zakatAmount}
                          paid={totalPaid}
                          currency={cycle.currency}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Hawl in progress — no Zakat due yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
