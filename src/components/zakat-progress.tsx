import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";

export function ZakatProgress({
  total,
  paid,
  currency,
}: {
  total: number;
  paid: number;
  currency: string;
}) {
  const remaining = Math.max(0, total - paid);
  const percentage = total > 0 ? Math.min(100, (paid / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Distributed</span>
        <span className="font-medium">
          {formatCurrency(paid, currency)} / {formatCurrency(total, currency)}
        </span>
      </div>
      <Progress value={percentage} />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Remaining</span>
        <span className="font-medium">
          {formatCurrency(remaining, currency)}
        </span>
      </div>
    </div>
  );
}
