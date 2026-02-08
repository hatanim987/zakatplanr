"use client";

import { useActionState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CurrencyInput } from "@/components/currency-input";
import { VoriQuantityInput } from "@/components/vori-quantity-input";
import {
  createSnapshot,
  type SnapshotFormState,
} from "./actions";
import {
  calculateNisabValues,
  calculateTotalWealth,
  calculateZakat,
  isNisabMet,
  getNisabThreshold,
  voriToGram,
  toTotalVori,
  NISAB_GOLD_VORI,
  NISAB_SILVER_VORI,
  ZAKAT_RATE,
} from "@/lib/zakat";
import { formatCurrency } from "@/lib/format";
import { useState } from "react";
import type { AssetSnapshot } from "@/db/schema";

const initialState: SnapshotFormState = {};

export function SnapshotForm({
  defaultValues,
}: {
  defaultValues: AssetSnapshot | null | undefined;
}) {
  const [state, formAction, isPending] = useActionState(
    createSnapshot,
    initialState
  );

  // Pre-fill from last snapshot
  const dv = defaultValues;
  const [cashAndBank, setCashAndBank] = useState(dv?.cashAndBank ?? "");
  const [businessAssets, setBusinessAssets] = useState(dv?.businessAssets ?? "");
  const [stocks, setStocks] = useState(dv?.stocks ?? "");
  const [otherInvestments, setOtherInvestments] = useState(dv?.otherInvestments ?? "");
  const [receivables, setReceivables] = useState(dv?.receivables ?? "");
  const [liabilities, setLiabilities] = useState(dv?.liabilities ?? "");
  const [goldPrice, setGoldPrice] = useState(dv?.goldPricePerVori ?? "");
  const [silverPrice, setSilverPrice] = useState(dv?.silverPricePerVori ?? "");

  const [goldVori, setGoldVori] = useState(() => {
    if (!dv?.goldVori) return "";
    const total = parseFloat(dv.goldVori);
    return Math.floor(total).toString();
  });
  const [goldAna, setGoldAna] = useState(() => {
    if (!dv?.goldVori) return "";
    const total = parseFloat(dv.goldVori);
    const remainder = total - Math.floor(total);
    return Math.floor(remainder * 16).toString();
  });
  const [goldRoti, setGoldRoti] = useState("");

  const [silverVori, setSilverVori] = useState(() => {
    if (!dv?.silverVori) return "";
    const total = parseFloat(dv.silverVori);
    return Math.floor(total).toString();
  });
  const [silverAna, setSilverAna] = useState(() => {
    if (!dv?.silverVori) return "";
    const total = parseFloat(dv.silverVori);
    const remainder = total - Math.floor(total);
    return Math.floor(remainder * 16).toString();
  });
  const [silverRoti, setSilverRoti] = useState("");

  // Auto-calculate gold BDT value
  const goldValue = useMemo(() => {
    const gp = parseFloat(goldPrice as string) || 0;
    const v = parseFloat(goldVori) || 0;
    const a = parseFloat(goldAna) || 0;
    const r = parseFloat(goldRoti) || 0;
    if (gp <= 0) return 0;
    return toTotalVori(v, a, r) * gp;
  }, [goldPrice, goldVori, goldAna, goldRoti]);

  const silverValue = useMemo(() => {
    const sp = parseFloat(silverPrice as string) || 0;
    const v = parseFloat(silverVori) || 0;
    const a = parseFloat(silverAna) || 0;
    const r = parseFloat(silverRoti) || 0;
    if (sp <= 0) return 0;
    return toTotalVori(v, a, r) * sp;
  }, [silverPrice, silverVori, silverAna, silverRoti]);

  const goldVoriTotal = useMemo(() => {
    return toTotalVori(
      parseFloat(goldVori) || 0,
      parseFloat(goldAna) || 0,
      parseFloat(goldRoti) || 0
    );
  }, [goldVori, goldAna, goldRoti]);

  const silverVoriTotal = useMemo(() => {
    return toTotalVori(
      parseFloat(silverVori) || 0,
      parseFloat(silverAna) || 0,
      parseFloat(silverRoti) || 0
    );
  }, [silverVori, silverAna, silverRoti]);

  // Live calculation preview
  const preview = useMemo(() => {
    const assets = {
      cashAndBank: parseFloat(cashAndBank as string) || 0,
      gold: goldValue,
      silver: silverValue,
      businessAssets: parseFloat(businessAssets as string) || 0,
      stocks: parseFloat(stocks as string) || 0,
      otherInvestments: parseFloat(otherInvestments as string) || 0,
      receivables: parseFloat(receivables as string) || 0,
      liabilities: parseFloat(liabilities as string) || 0,
    };

    const gpVori = parseFloat(goldPrice as string) || 0;
    const spVori = parseFloat(silverPrice as string) || 0;
    const gpGram = gpVori > 0 ? voriToGram(gpVori) : undefined;
    const spGram = spVori > 0 ? voriToGram(spVori) : undefined;

    const totalWealth = calculateTotalWealth(assets);
    const hasAnyPrice = gpGram || spGram;
    const nisab = hasAnyPrice ? calculateNisabValues(gpGram, spGram) : null;
    const nisabThreshold = nisab
      ? getNisabThreshold(nisab.goldNisab, nisab.silverNisab)
      : null;
    const nisabCheck = nisabThreshold
      ? isNisabMet(totalWealth, nisabThreshold)
      : null;
    const zakatAmount = nisabCheck ? calculateZakat(totalWealth) : 0;

    return { totalWealth, nisab, nisabThreshold, nisabCheck, zakatAmount };
  }, [
    cashAndBank,
    goldValue,
    silverValue,
    businessAssets,
    stocks,
    otherInvestments,
    receivables,
    liabilities,
    goldPrice,
    silverPrice,
  ]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form action={formAction} className="space-y-6 lg:col-span-2">
        {/* Snapshot Date */}
        <Card>
          <CardHeader>
            <CardTitle>Snapshot Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="snapshotDate">Date</Label>
              <Input
                id="snapshotDate"
                name="snapshotDate"
                type="date"
                defaultValue={today}
              />
              {state.errors?.snapshotDate && (
                <p className="text-sm text-destructive">
                  {state.errors.snapshotDate}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metal Prices */}
        <Card>
          <CardHeader>
            <CardTitle>Current Metal Prices</CardTitle>
            <CardDescription>
              Price per vori (ভরি) for Nisab calculation. Nisab ≈{" "}
              {NISAB_GOLD_VORI.toFixed(1)} vori gold or{" "}
              {NISAB_SILVER_VORI.toFixed(1)} vori silver.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <CurrencyInput
              name="goldPrice"
              label="Gold Price / vori (ভরি)"
              value={goldPrice as string}
              onChange={setGoldPrice}
              error={state.errors?.goldPrice}
            />
            <div className="space-y-1.5">
              <CurrencyInput
                name="silverPrice"
                label="Silver Price / vori (ভরি)"
                value={silverPrice as string}
                onChange={setSilverPrice}
              />
              <p className="text-xs text-muted-foreground">
                Optional — leave empty if you don&apos;t have silver
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Zakatable Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Zakatable Assets</CardTitle>
            <CardDescription>
              Enter the current value of your assets.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <CurrencyInput
              name="cashAndBank"
              label="Cash & Bank Balance"
              value={cashAndBank as string}
              onChange={setCashAndBank}
            />
            <div className="sm:col-span-2" />
            <VoriQuantityInput
              label="Gold Quantity"
              vori={goldVori}
              onVoriChange={setGoldVori}
              ana={goldAna}
              onAnaChange={setGoldAna}
              roti={goldRoti}
              onRotiChange={setGoldRoti}
              computedValue={goldValue}
              priceAvailable={(parseFloat(goldPrice as string) || 0) > 0}
            />
            <input type="hidden" name="gold" value={goldValue.toString()} />
            <input type="hidden" name="goldVoriTotal" value={goldVoriTotal.toString()} />
            <VoriQuantityInput
              label="Silver Quantity"
              vori={silverVori}
              onVoriChange={setSilverVori}
              ana={silverAna}
              onAnaChange={setSilverAna}
              roti={silverRoti}
              onRotiChange={setSilverRoti}
              computedValue={silverValue}
              priceAvailable={(parseFloat(silverPrice as string) || 0) > 0}
            />
            <input type="hidden" name="silver" value={silverValue.toString()} />
            <input type="hidden" name="silverVoriTotal" value={silverVoriTotal.toString()} />
            <CurrencyInput
              name="businessAssets"
              label="Business Assets / Inventory"
              value={businessAssets as string}
              onChange={setBusinessAssets}
            />
            <CurrencyInput
              name="stocks"
              label="Stocks & Shares"
              value={stocks as string}
              onChange={setStocks}
            />
            <CurrencyInput
              name="otherInvestments"
              label="Other Investments"
              value={otherInvestments as string}
              onChange={setOtherInvestments}
            />
            <CurrencyInput
              name="receivables"
              label="Receivables (debts owed to you)"
              value={receivables as string}
              onChange={setReceivables}
            />
            <Separator className="sm:col-span-2" />
            <CurrencyInput
              name="liabilities"
              label="Liabilities (debts you owe)"
              value={liabilities as string}
              onChange={setLiabilities}
            />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any notes about this snapshot..."
              />
            </div>
          </CardContent>
        </Card>

        <input type="hidden" name="currency" value="BDT" />

        {state.message && (
          <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <p className="text-sm">{state.message}</p>
            </CardContent>
          </Card>
        )}

        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Saving Snapshot..." : "Save Asset Snapshot"}
        </Button>
      </form>

      {/* Live Preview — sticky sidebar */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Calculation Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Wealth</span>
              <span className="font-semibold">
                {formatCurrency(preview.totalWealth)}
              </span>
            </div>
            {preview.nisab && (
              <>
                <Separator />
                {preview.nisab.goldNisab !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Gold Nisab (~{NISAB_GOLD_VORI.toFixed(1)} vori)
                    </span>
                    <span>{formatCurrency(preview.nisab.goldNisab)}</span>
                  </div>
                )}
                {preview.nisab.silverNisab !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Silver Nisab (~{NISAB_SILVER_VORI.toFixed(1)} vori)
                    </span>
                    <span>{formatCurrency(preview.nisab.silverNisab)}</span>
                  </div>
                )}
                {preview.nisabThreshold && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Nisab Threshold
                      </span>
                      <span>{formatCurrency(preview.nisabThreshold)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nisab Met?</span>
                      <span
                        className={
                          preview.nisabCheck
                            ? "text-green-600 font-medium"
                            : "text-red-500 font-medium"
                        }
                      >
                        {preview.nisabCheck === null
                          ? "—"
                          : preview.nisabCheck
                            ? "Yes"
                            : "No"}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-medium">
                Estimated Zakat ({ZAKAT_RATE * 100}%)
              </span>
              <span className="font-bold text-primary">
                {formatCurrency(preview.zakatAmount)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Zakat is due only after wealth stays above Nisab for 12 lunar
              months (Hawl).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
