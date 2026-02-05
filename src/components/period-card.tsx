import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ZakatProgress } from "./zakat-progress";
import { formatDateRange } from "@/lib/format";

interface PeriodCardProps {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  zakatAmount: string;
  totalPaid: string;
  isManualEntry: boolean;
  currency: string;
}

export function PeriodCard({
  id,
  name,
  startDate,
  endDate,
  zakatAmount,
  totalPaid,
  isManualEntry,
  currency,
}: PeriodCardProps) {
  return (
    <Link href={`/periods/${id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{name}</CardTitle>
            {isManualEntry && (
              <Badge variant="secondary">Manual</Badge>
            )}
          </div>
          <CardDescription>
            {formatDateRange(startDate, endDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ZakatProgress
            total={parseFloat(zakatAmount)}
            paid={parseFloat(totalPaid)}
            currency={currency}
          />
        </CardContent>
      </Card>
    </Link>
  );
}
