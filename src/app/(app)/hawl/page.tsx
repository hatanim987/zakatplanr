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
import { HawlStatusBadge } from "@/components/hawl-status-badge";
import { ZakatProgress } from "@/components/zakat-progress";
import { getAllHawlCycles } from "@/db/queries";
import { formatDate, formatDateDual } from "@/lib/format";
import type { HawlStatus } from "@/lib/hawl";
import { requireUserId } from "@/lib/auth-utils";

function CycleCard({
  cycle,
  dimmed = false,
}: {
  cycle: Awaited<ReturnType<typeof getAllHawlCycles>>[number];
  dimmed?: boolean;
}) {
  const zakatAmount = cycle.zakatAmount ? parseFloat(cycle.zakatAmount) : 0;
  const totalPaid = parseFloat(cycle.totalPaid);

  return (
    <Link href={`/hawl/${cycle.id}`}>
      <Card
        className={`transition-shadow hover:shadow-md ${dimmed ? "opacity-75" : ""}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {formatDate(cycle.hawlStartDate)}
            </CardTitle>
            <HawlStatusBadge status={cycle.status as HawlStatus} />
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
          ) : cycle.status === "reset" ? (
            <p className="text-sm text-muted-foreground">
              Hawl was reset before completion.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Hawl in progress — no Zakat due yet.
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function HawlHistoryPage() {
  const userId = await requireUserId();
  let cycles: Awaited<ReturnType<typeof getAllHawlCycles>> = [];

  try {
    cycles = await getAllHawlCycles(userId);
  } catch {
    // DB not connected
  }

  const activeCycles = cycles.filter(
    (c) => c.status === "tracking" || c.status === "due"
  );
  const completedCycles = cycles.filter(
    (c) => c.status === "paid" || c.status === "reset"
  );

  return (
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
          <div className="space-y-8">
            {activeCycles.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold">Active</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeCycles.map((cycle) => (
                    <CycleCard key={cycle.id} cycle={cycle} />
                  ))}
                </div>
              </div>
            )}

            {completedCycles.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-muted-foreground">
                  Completed
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {completedCycles.map((cycle) => (
                    <CycleCard key={cycle.id} cycle={cycle} dimmed />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
  );
}
