"use server";

import { db } from "@/db";
import { zakatPeriods } from "@/db/schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  calculateNisabValues,
  calculateTotalWealth,
  calculateZakat,
  isNisabMet,
  getNisabThreshold,
  voriToGram,
} from "@/lib/zakat";

export type CalculateFormState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function createPeriodWithCalculation(
  _prevState: CalculateFormState,
  formData: FormData
): Promise<CalculateFormState> {
  const name = formData.get("name") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  // Prices are entered per vori — convert to per gram for calculation
  const goldPricePerVori = parseFloat(formData.get("goldPrice") as string);
  const silverPricePerVori = parseFloat(formData.get("silverPrice") as string);
  const currency = (formData.get("currency") as string) || "BDT";
  const notes = formData.get("notes") as string;

  const assets = {
    cashAndBank: parseFloat(formData.get("cashAndBank") as string) || 0,
    gold: parseFloat(formData.get("gold") as string) || 0,
    silver: parseFloat(formData.get("silver") as string) || 0,
    businessAssets: parseFloat(formData.get("businessAssets") as string) || 0,
    stocks: parseFloat(formData.get("stocks") as string) || 0,
    otherInvestments:
      parseFloat(formData.get("otherInvestments") as string) || 0,
    receivables: parseFloat(formData.get("receivables") as string) || 0,
    liabilities: parseFloat(formData.get("liabilities") as string) || 0,
  };

  // Validate required fields
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Period name is required";
  if (!startDate) errors.startDate = "Start date is required";
  if (!endDate) errors.endDate = "End date is required";
  if ((!goldPricePerVori || goldPricePerVori <= 0) && (!silverPricePerVori || silverPricePerVori <= 0))
    errors.goldPrice = "At least one metal price (gold or silver) is required";

  if (Object.keys(errors).length > 0) return { errors };

  // Convert vori prices to gram prices
  const goldPricePerGram = goldPricePerVori > 0 ? voriToGram(goldPricePerVori) : undefined;
  const silverPricePerGram = silverPricePerVori > 0 ? voriToGram(silverPricePerVori) : undefined;

  const totalWealth = calculateTotalWealth(assets);
  const { goldNisab, silverNisab } = calculateNisabValues(goldPricePerGram, silverPricePerGram);
  const nisabThreshold = getNisabThreshold(goldNisab, silverNisab);
  const nisabCheck = nisabThreshold ? isNisabMet(totalWealth, nisabThreshold) : false;
  const zakatAmount = nisabCheck ? calculateZakat(totalWealth) : 0;

  if (!nisabCheck) {
    return {
      message:
        "Your total wealth is below the Nisab threshold. Zakat is not obligatory, but you may still give voluntarily.",
    };
  }

  const [period] = await db
    .insert(zakatPeriods)
    .values({
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      cashAndBank: assets.cashAndBank.toString(),
      gold: assets.gold.toString(),
      silver: assets.silver.toString(),
      businessAssets: assets.businessAssets.toString(),
      stocks: assets.stocks.toString(),
      otherInvestments: assets.otherInvestments.toString(),
      receivables: assets.receivables.toString(),
      liabilities: assets.liabilities.toString(),
      totalWealth: totalWealth.toString(),
      zakatAmount: zakatAmount.toString(),
      isManualEntry: false,
      nisabMet: true,
      currency,
      notes: notes || null,
    })
    .returning({ id: zakatPeriods.id });

  revalidatePath("/periods");
  revalidatePath("/");
  redirect(`/periods/${period.id}`);
}

export async function createPeriodManual(
  _prevState: CalculateFormState,
  formData: FormData
): Promise<CalculateFormState> {
  const name = formData.get("name") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const zakatAmount = parseFloat(formData.get("zakatAmount") as string);
  const currency = (formData.get("currency") as string) || "BDT";
  const notes = formData.get("notes") as string;

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Period name is required";
  if (!startDate) errors.startDate = "Start date is required";
  if (!endDate) errors.endDate = "End date is required";
  if (!zakatAmount || zakatAmount <= 0)
    errors.zakatAmount = "Zakat amount must be greater than 0";

  if (Object.keys(errors).length > 0) return { errors };

  const [period] = await db
    .insert(zakatPeriods)
    .values({
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      zakatAmount: zakatAmount.toString(),
      isManualEntry: true,
      nisabMet: true,
      currency,
      notes: notes || null,
    })
    .returning({ id: zakatPeriods.id });

  revalidatePath("/periods");
  revalidatePath("/");
  redirect(`/periods/${period.id}`);
}
