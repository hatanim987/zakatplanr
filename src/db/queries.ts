import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { assetSnapshots, hawlCycles, zakatPayments } from "./schema";

// ─── Asset Snapshots ───

export async function getLatestSnapshot() {
  return await db.query.assetSnapshots.findFirst({
    orderBy: desc(assetSnapshots.snapshotDate),
  });
}

export async function getAllSnapshots(limit: number = 50) {
  return await db.query.assetSnapshots.findMany({
    orderBy: desc(assetSnapshots.snapshotDate),
    limit,
  });
}

export async function getSnapshotsByDateRange(start: Date, end: Date) {
  return await db
    .select()
    .from(assetSnapshots)
    .where(
      and(
        sql`${assetSnapshots.snapshotDate} >= ${start}`,
        sql`${assetSnapshots.snapshotDate} <= ${end}`
      )
    )
    .orderBy(desc(assetSnapshots.snapshotDate));
}

// ─── Hawl Cycles ───

export async function getTrackingCycle() {
  return await db.query.hawlCycles.findFirst({
    where: eq(hawlCycles.status, "tracking"),
    orderBy: desc(hawlCycles.createdAt),
  });
}

export async function getDueCycles() {
  return await db
    .select({
      id: hawlCycles.id,
      status: hawlCycles.status,
      hawlStartDate: hawlCycles.hawlStartDate,
      hawlStartHijri: hawlCycles.hawlStartHijri,
      hawlDueDate: hawlCycles.hawlDueDate,
      hawlDueHijri: hawlCycles.hawlDueHijri,
      zakatAmount: hawlCycles.zakatAmount,
      wealthAtDue: hawlCycles.wealthAtDue,
      currency: hawlCycles.currency,
      createdAt: hawlCycles.createdAt,
      totalPaid: sql<string>`COALESCE(SUM(${zakatPayments.amount}), '0')`,
      paymentCount: sql<number>`COUNT(${zakatPayments.id})::int`,
    })
    .from(hawlCycles)
    .leftJoin(zakatPayments, eq(zakatPayments.hawlCycleId, hawlCycles.id))
    .where(eq(hawlCycles.status, "due"))
    .groupBy(hawlCycles.id)
    .orderBy(hawlCycles.hawlStartDate);
}

export async function getAllHawlCycles() {
  return await db
    .select({
      id: hawlCycles.id,
      status: hawlCycles.status,
      hawlStartDate: hawlCycles.hawlStartDate,
      hawlStartHijri: hawlCycles.hawlStartHijri,
      hawlDueDate: hawlCycles.hawlDueDate,
      hawlDueHijri: hawlCycles.hawlDueHijri,
      endDate: hawlCycles.endDate,
      zakatAmount: hawlCycles.zakatAmount,
      currency: hawlCycles.currency,
      createdAt: hawlCycles.createdAt,
      totalPaid: sql<string>`COALESCE(SUM(${zakatPayments.amount}), '0')`,
    })
    .from(hawlCycles)
    .leftJoin(zakatPayments, eq(zakatPayments.hawlCycleId, hawlCycles.id))
    .groupBy(hawlCycles.id)
    .orderBy(desc(hawlCycles.createdAt));
}

export async function getHawlCycleById(id: string) {
  return await db.query.hawlCycles.findFirst({
    where: eq(hawlCycles.id, id),
  });
}

// ─── Payments ───

export async function getPaymentsByHawlCycleId(hawlCycleId: string) {
  return await db.query.zakatPayments.findMany({
    where: eq(zakatPayments.hawlCycleId, hawlCycleId),
    orderBy: desc(zakatPayments.date),
  });
}

export async function getHawlPaymentSummary(hawlCycleId: string) {
  const result = await db
    .select({
      totalPaid: sql<string>`COALESCE(SUM(${zakatPayments.amount}), '0')`,
      paymentCount: sql<number>`COUNT(${zakatPayments.id})::int`,
    })
    .from(zakatPayments)
    .where(eq(zakatPayments.hawlCycleId, hawlCycleId));

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
      currency: hawlCycles.currency,
    })
    .from(zakatPayments)
    .innerJoin(hawlCycles, eq(zakatPayments.hawlCycleId, hawlCycles.id))
    .orderBy(desc(zakatPayments.date))
    .limit(limit);
}
