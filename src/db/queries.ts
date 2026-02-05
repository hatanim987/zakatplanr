import { desc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { zakatPayments, zakatPeriods } from "./schema";

export async function getAllPeriodsWithSummary() {
  return await db
    .select({
      id: zakatPeriods.id,
      name: zakatPeriods.name,
      startDate: zakatPeriods.startDate,
      endDate: zakatPeriods.endDate,
      zakatAmount: zakatPeriods.zakatAmount,
      isManualEntry: zakatPeriods.isManualEntry,
      currency: zakatPeriods.currency,
      createdAt: zakatPeriods.createdAt,
      totalPaid: sql<string>`COALESCE(SUM(${zakatPayments.amount}), '0')`,
    })
    .from(zakatPeriods)
    .leftJoin(zakatPayments, eq(zakatPayments.periodId, zakatPeriods.id))
    .groupBy(zakatPeriods.id)
    .orderBy(desc(zakatPeriods.createdAt));
}

export async function getPeriodById(id: string) {
  return await db.query.zakatPeriods.findFirst({
    where: eq(zakatPeriods.id, id),
  });
}

export async function getPaymentsByPeriodId(periodId: string) {
  return await db.query.zakatPayments.findMany({
    where: eq(zakatPayments.periodId, periodId),
    orderBy: desc(zakatPayments.date),
  });
}

export async function getPaymentSummary(periodId: string) {
  const result = await db
    .select({
      totalPaid: sql<string>`COALESCE(SUM(${zakatPayments.amount}), '0')`,
      paymentCount: sql<number>`COUNT(${zakatPayments.id})::int`,
    })
    .from(zakatPayments)
    .where(eq(zakatPayments.periodId, periodId));

  return result[0] ?? { totalPaid: "0", paymentCount: 0 };
}

export async function getRecentPayments(limit: number = 5) {
  return await db
    .select({
      id: zakatPayments.id,
      amount: zakatPayments.amount,
      recipient: zakatPayments.recipient,
      category: zakatPayments.category,
      date: zakatPayments.date,
      periodName: zakatPeriods.name,
      currency: zakatPeriods.currency,
    })
    .from(zakatPayments)
    .innerJoin(zakatPeriods, eq(zakatPayments.periodId, zakatPeriods.id))
    .orderBy(desc(zakatPayments.date))
    .limit(limit);
}

export async function getLatestPeriod() {
  return await db.query.zakatPeriods.findFirst({
    orderBy: desc(zakatPeriods.createdAt),
  });
}
