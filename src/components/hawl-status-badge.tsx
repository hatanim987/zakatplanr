import { Badge } from "@/components/ui/badge";
import type { HawlStatus } from "@/lib/hawl";

const statusConfig: Record<
  HawlStatus,
  { label: string; className: string }
> = {
  idle: { label: "No Active Hawl", className: "bg-gray-500" },
  tracking: { label: "Tracking", className: "bg-blue-600" },
  due: { label: "Zakat Due", className: "bg-amber-600" },
  paid: { label: "Paid", className: "bg-green-600" },
  reset: { label: "Reset", className: "bg-gray-500" },
};

export function HawlStatusBadge({ status }: { status: HawlStatus }) {
  const config = statusConfig[status];
  return <Badge className={config.className}>{config.label}</Badge>;
}
