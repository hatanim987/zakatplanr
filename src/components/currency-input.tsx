"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CurrencyInput({
  name,
  label,
  value,
  onChange,
  error,
  placeholder = "0.00",
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          ৳
        </span>
        <Input
          id={name}
          name={name}
          type="number"
          step="0.01"
          min="0"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-7"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
