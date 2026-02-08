import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function StaleReminder({ daysSinceUpdate }: { daysSinceUpdate: number }) {
  return (
    <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
      <CardContent className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <p className="text-sm">
            You haven&apos;t updated your assets in{" "}
            <span className="font-semibold">{daysSinceUpdate} days</span>.
            Update now to keep your Hawl tracking accurate.
          </p>
        </div>
        <Link href="/snapshot/new">
          <Button size="sm" variant="outline">
            Update Now
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
