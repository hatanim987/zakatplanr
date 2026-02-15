export const dynamic = "force-dynamic";

import { getLatestSnapshot } from "@/db/queries";
import { AppHeader } from "@/components/app-header";
import { SnapshotForm } from "./snapshot-form";
import { requireUserId } from "@/lib/auth-utils";

export default async function NewSnapshotPage() {
  const userId = await requireUserId();
  let lastSnapshot = null;

  try {
    lastSnapshot = await getLatestSnapshot(userId);
  } catch {
    // DB not connected yet
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Update Assets</h2>
          <p className="mt-1 text-muted-foreground">
            Log your current wealth to keep Hawl tracking accurate.
          </p>
        </div>
        <SnapshotForm defaultValues={lastSnapshot} />
      </main>
    </div>
  );
}
