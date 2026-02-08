"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";

export function VoriQuantityInput({
  label,
  vori,
  onVoriChange,
  ana,
  onAnaChange,
  roti,
  onRotiChange,
  computedValue,
  priceAvailable,
}: {
  label: string;
  vori: string;
  onVoriChange: (v: string) => void;
  ana: string;
  onAnaChange: (v: string) => void;
  roti: string;
  onRotiChange: (v: string) => void;
  computedValue: number;
  priceAvailable: boolean;
}) {
  return (
    <div className="space-y-2 sm:col-span-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={vori}
            onChange={(e) => onVoriChange(e.target.value)}
          />
          <span className="text-xs text-muted-foreground">ভরি (vori)</span>
        </div>
        <div className="space-y-1">
          <Input
            type="number"
            min="0"
            max="15"
            step="1"
            placeholder="0"
            value={ana}
            onChange={(e) => onAnaChange(e.target.value)}
          />
          <span className="text-xs text-muted-foreground">আনা (ana)</span>
        </div>
        <div className="space-y-1">
          <Input
            type="number"
            min="0"
            max="5"
            step="1"
            placeholder="0"
            value={roti}
            onChange={(e) => onRotiChange(e.target.value)}
          />
          <span className="text-xs text-muted-foreground">রতি (roti)</span>
        </div>
      </div>
      {computedValue > 0 && priceAvailable && (
        <p className="text-sm font-medium text-muted-foreground">
          = {formatCurrency(computedValue)}
        </p>
      )}
      {!priceAvailable &&
        (parseFloat(vori) > 0 || parseFloat(ana) > 0 || parseFloat(roti) > 0) && (
          <p className="text-xs text-muted-foreground">
            Enter metal price above to see value
          </p>
        )}
    </div>
  );
}
