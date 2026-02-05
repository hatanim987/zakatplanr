"use client";

import { useActionState, useState, useMemo } from "react";
import Link from "next/link";
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
import {
  createPeriodWithCalculation,
  createPeriodManual,
  type CalculateFormState,
} from "./actions";
import {
  calculateNisabValues,
  calculateTotalWealth,
  calculateZakat,
  isNisabMet,
  getNisabThreshold,
  voriToGram,
  NISAB_GOLD_VORI,
  NISAB_SILVER_VORI,
  ZAKAT_RATE,
} from "@/lib/zakat";
import { formatCurrency } from "@/lib/format";

type Mode = "calculate" | "manual";

const initialState: CalculateFormState = {};

function CurrencyInput({
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

export default function CalculatePage() {
  const [mode, setMode] = useState<Mode>("calculate");
  const [calcState, calcAction, calcPending] = useActionState(
    createPeriodWithCalculation,
    initialState
  );
  const [manualState, manualAction, manualPending] = useActionState(
    createPeriodManual,
    initialState
  );

  // Wealth fields for live calculation
  const [cashAndBank, setCashAndBank] = useState("");
  const [gold, setGold] = useState("");
  const [silver, setSilver] = useState("");
  const [businessAssets, setBusinessAssets] = useState("");
  const [stocks, setStocks] = useState("");
  const [otherInvestments, setOtherInvestments] = useState("");
  const [receivables, setReceivables] = useState("");
  const [liabilities, setLiabilities] = useState("");
  const [goldPrice, setGoldPrice] = useState("");
  const [silverPrice, setSilverPrice] = useState("");

  // Live calculation preview
  const preview = useMemo(() => {
    const assets = {
      cashAndBank: parseFloat(cashAndBank) || 0,
      gold: parseFloat(gold) || 0,
      silver: parseFloat(silver) || 0,
      businessAssets: parseFloat(businessAssets) || 0,
      stocks: parseFloat(stocks) || 0,
      otherInvestments: parseFloat(otherInvestments) || 0,
      receivables: parseFloat(receivables) || 0,
      liabilities: parseFloat(liabilities) || 0,
    };

    const gpVori = parseFloat(goldPrice) || 0;
    const spVori = parseFloat(silverPrice) || 0;
    // Convert vori prices to gram prices for calculation
    const gpGram = gpVori > 0 ? voriToGram(gpVori) : undefined;
    const spGram = spVori > 0 ? voriToGram(spVori) : undefined;

    const totalWealth = calculateTotalWealth(assets);
    const hasAnyPrice = gpGram || spGram;
    const nisab = hasAnyPrice ? calculateNisabValues(gpGram, spGram) : null;
    const nisabThreshold = nisab ? getNisabThreshold(nisab.goldNisab, nisab.silverNisab) : null;
    const nisabCheck = nisabThreshold ? isNisabMet(totalWealth, nisabThreshold) : null;
    const zakatAmount = nisabCheck ? calculateZakat(totalWealth) : 0;

    return { totalWealth, nisab, nisabThreshold, nisabCheck, zakatAmount };
  }, [
    cashAndBank, gold, silver, businessAssets, stocks,
    otherInvestments, receivables, liabilities, goldPrice, silverPrice,
  ]);

  const today = new Date().toISOString().split("T")[0];
  const nextYear = new Date(
    new Date().setFullYear(new Date().getFullYear() + 1)
  )
    .toISOString()
    .split("T")[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            ZakatPlanr
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Calculate Zakat
          </h2>
          <p className="mt-1 text-muted-foreground">
            Enter your wealth details or input a pre-calculated amount.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={mode === "calculate" ? "default" : "outline"}
            onClick={() => setMode("calculate")}
          >
            Full Calculation
          </Button>
          <Button
            variant={mode === "manual" ? "default" : "outline"}
            onClick={() => setMode("manual")}
          >
            Enter Amount Directly
          </Button>
        </div>

        {mode === "calculate" ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Form — takes 2 columns */}
            <form action={calcAction} className="space-y-6 lg:col-span-2">
              {/* Period Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Period Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Period Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., 2025-2026"
                      defaultValue={`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`}
                    />
                    {calcState.errors?.name && (
                      <p className="text-sm text-destructive">
                        {calcState.errors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      defaultValue={today}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      defaultValue={nextYear}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Nisab Prices */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Metal Prices</CardTitle>
                  <CardDescription>
                    Enter current market price per vori (ভরি) for Nisab
                    calculation. Nisab ≈ {NISAB_GOLD_VORI.toFixed(1)} vori gold
                    or {NISAB_SILVER_VORI.toFixed(1)} vori silver. At least one
                    price is required.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <CurrencyInput
                    name="goldPrice"
                    label="Gold Price / vori (ভরি)"
                    value={goldPrice}
                    onChange={setGoldPrice}
                    error={calcState.errors?.goldPrice}
                  />
                  <div className="space-y-1.5">
                    <CurrencyInput
                      name="silverPrice"
                      label="Silver Price / vori (ভরি)"
                      value={silverPrice}
                      onChange={setSilverPrice}
                      error={calcState.errors?.silverPrice}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional — leave empty if you don&apos;t have silver
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Wealth Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Zakatable Assets</CardTitle>
                  <CardDescription>
                    Enter the current value of your assets. Leave empty if not
                    applicable.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <CurrencyInput
                    name="cashAndBank"
                    label="Cash & Bank Balance"
                    value={cashAndBank}
                    onChange={setCashAndBank}
                  />
                  <CurrencyInput
                    name="gold"
                    label="Gold (value)"
                    value={gold}
                    onChange={setGold}
                  />
                  <CurrencyInput
                    name="silver"
                    label="Silver (value)"
                    value={silver}
                    onChange={setSilver}
                  />
                  <CurrencyInput
                    name="businessAssets"
                    label="Business Assets / Inventory"
                    value={businessAssets}
                    onChange={setBusinessAssets}
                  />
                  <CurrencyInput
                    name="stocks"
                    label="Stocks & Shares"
                    value={stocks}
                    onChange={setStocks}
                  />
                  <CurrencyInput
                    name="otherInvestments"
                    label="Other Investments"
                    value={otherInvestments}
                    onChange={setOtherInvestments}
                  />
                  <CurrencyInput
                    name="receivables"
                    label="Receivables (debts owed to you)"
                    value={receivables}
                    onChange={setReceivables}
                  />
                  <Separator className="sm:col-span-2" />
                  <CurrencyInput
                    name="liabilities"
                    label="Liabilities (debts you owe)"
                    value={liabilities}
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
                      placeholder="Any notes about this calculation..."
                    />
                  </div>
                </CardContent>
              </Card>

              <input type="hidden" name="currency" value="BDT" />

              {calcState.message && (
                <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                  <CardContent className="pt-6">
                    <p className="text-sm">{calcState.message}</p>
                  </CardContent>
                </Card>
              )}

              <Button type="submit" size="lg" disabled={calcPending}>
                {calcPending ? "Creating Period..." : "Create Zakat Period"}
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
                          <span>
                            {formatCurrency(preview.nisab.silverNisab)}
                          </span>
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
                            <span className="text-muted-foreground">
                              Nisab Met?
                            </span>
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
                      Zakat Due ({ZAKAT_RATE * 100}%)
                    </span>
                    <span className="font-bold text-primary">
                      {formatCurrency(preview.zakatAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Manual Entry Mode */
          <form action={manualAction} className="max-w-lg space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Period Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="m-name">Period Name</Label>
                  <Input
                    id="m-name"
                    name="name"
                    placeholder="e.g., 2025-2026"
                    defaultValue={`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`}
                  />
                  {manualState.errors?.name && (
                    <p className="text-sm text-destructive">
                      {manualState.errors.name}
                    </p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="m-startDate">Start Date</Label>
                    <Input
                      id="m-startDate"
                      name="startDate"
                      type="date"
                      defaultValue={today}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-endDate">End Date</Label>
                    <Input
                      id="m-endDate"
                      name="endDate"
                      type="date"
                      defaultValue={nextYear}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zakat Amount</CardTitle>
                <CardDescription>
                  Enter the total Zakat amount you want to distribute.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="m-zakatAmount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      ৳
                    </span>
                    <Input
                      id="m-zakatAmount"
                      name="zakatAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                  {manualState.errors?.zakatAmount && (
                    <p className="text-sm text-destructive">
                      {manualState.errors.zakatAmount}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="m-notes">Notes (optional)</Label>
                  <Textarea
                    id="m-notes"
                    name="notes"
                    placeholder="Any notes..."
                  />
                </div>
              </CardContent>
            </Card>

            <input type="hidden" name="currency" value="BDT" />

            <Button type="submit" size="lg" disabled={manualPending}>
              {manualPending ? "Creating Period..." : "Create Zakat Period"}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
