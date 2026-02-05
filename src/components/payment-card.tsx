"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { Trash2 } from "lucide-react";

interface PaymentCardProps {
  id: string;
  amount: string;
  recipient: string | null;
  category: string | null;
  date: Date;
  notes: string | null;
  currency: string;
  onDelete?: (id: string) => void;
}

export function PaymentCard({
  id,
  amount,
  recipient,
  category,
  date,
  notes,
  currency,
  onDelete,
}: PaymentCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between pt-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              {formatCurrency(amount, currency)}
            </span>
            {category && <Badge variant="secondary">{category}</Badge>}
          </div>
          {recipient && (
            <p className="text-sm text-muted-foreground">To: {recipient}</p>
          )}
          <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
          {notes && <p className="mt-2 text-sm">{notes}</p>}
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
