import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { assetSnapshots, hawlCycles, zakatPayments } from "./schema";

// ─── Asset Snapshots ───

export async function getLatestSnapshot(userId: string) {
  return await db.query.assetSnapshots.findFirst({
    where: and(
      eq(assetSnapshots.userId, userId),
    ),
    orderBy: desc(assetSnapshots.snapshotDate),
  });
}

export async function getAllSnapshots(userId: string, limit: number = 50) {
  return await db.query.assetSnapshots.findMany({
    where: eq(assetSnapshots.userId, userId),
    orderBy: desc(assetSnapshots.snapshotDate),
    limit,
  });
}

export async function getSnapshotsByDateRange(userId: string, start: Date, end: Date) {
  return await db
    .select()
    .from(assetSnapshots)
    .where(
      and(
        eq(assetSnapshots.userId, userId),
        sql`${assetSnapshots.snapshotDate} >= ${start}`,
        sql`${assetSnapshots.snapshotDate} <= ${end}`
      )
    )
    .orderBy(desc(assetSnapshots.snapshotDate));
}

// ─── Hawl Cycles ───

export async function getTrackingCycle(userId: string) {
  return await db.query.hawlCycles.findFirst({
    where: and(
      eq(hawlCycles.userId, userId),
      eq(hawlCycles.status, "tracking"),
    ),
    orderBy: desc(hawlCycles.createdAt),
  });
}

export async function getDueCycles(userId: string) {
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
    .where(and(
      eq(hawlCycles.userId, userId),
      eq(hawlCycles.status, "due"),
    ))
    .groupBy(hawlCycles.id)
    .orderBy(hawlCycles.hawlStartDate);
}

export async function getAllHawlCycles(userId: string) {
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
    .where(eq(hawlCycles.userId, userId))
    .groupBy(hawlCycles.id)
    .orderBy(desc(hawlCycles.createdAt));
}

export async function getHawlCycleById(userId: string, id: string) {
  return await db.query.hawlCycles.findFirst({
    where: and(
      eq(hawlCycles.id, id),
      eq(hawlCycles.userId, userId),
    ),
  });
}

// ─── Payments ───

export async function getPaymentsByHawlCycleId(userId: string, hawlCycleId: string) {
  return await db
    .select({
      id: zakatPayments.id,
      userId: zakatPayments.userId,
      hawlCycleId: zakatPayments.hawlCycleId,
      amount: zakatPayments.amount,
      recipient: zakatPayments.recipient,
      category: zakatPayments.category,
      date: zakatPayments.date,
      notes: zakatPayments.notes,
      createdAt: zakatPayments.createdAt,
    })
    .from(zakatPayments)
    .innerJoin(hawlCycles, eq(zakatPayments.hawlCycleId, hawlCycles.id))
    .where(and(
      eq(zakatPayments.hawlCycleId, hawlCycleId),
      eq(hawlCycles.userId, userId),
    ))
    .orderBy(desc(zakatPayments.date));
}

export async function getHawlPaymentSummary(userId: string, hawlCycleId: string) {
  const result = await db
    .select({
      totalPaid: sql<string>`COALESCE(SUM(${zakatPayments.amount}), '0')`,
      paymentCount: sql<number>`COUNT(${zakatPayments.id})::int`,
    })
    .from(zakatPayments)
    .innerJoin(hawlCycles, eq(zakatPayments.hawlCycleId, hawlCycles.id))
    .where(and(
      eq(zakatPayments.hawlCycleId, hawlCycleId),
      eq(hawlCycles.userId, userId),
    ));

  return result[0] ?? { totalPaid: "0", paymentCount: 0 };
}

export async function getRecentPayments(userId: string, limit: number = 5) {
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
    .where(eq(hawlCycles.userId, userId))
    .orderBy(desc(zakatPayments.date))
    .limit(limit);
}
