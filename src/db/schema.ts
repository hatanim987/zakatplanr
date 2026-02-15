import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  boolean,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// ─── Auth Tables ───

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

// ─── Asset snapshots — user's wealth at a point in time ───

export const assetSnapshots = pgTable("asset_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),

  // Wealth breakdown
  cashAndBank: numeric("cash_and_bank", { precision: 15, scale: 2 }).default("0").notNull(),
  gold: numeric("gold", { precision: 15, scale: 2 }).default("0").notNull(),
  silver: numeric("silver", { precision: 15, scale: 2 }).default("0").notNull(),
  businessAssets: numeric("business_assets", { precision: 15, scale: 2 }).default("0").notNull(),
  stocks: numeric("stocks", { precision: 15, scale: 2 }).default("0").notNull(),
  otherInvestments: numeric("other_investments", { precision: 15, scale: 2 }).default("0").notNull(),
  receivables: numeric("receivables", { precision: 15, scale: 2 }).default("0").notNull(),
  liabilities: numeric("liabilities", { precision: 15, scale: 2 }).default("0").notNull(),

  // Metal prices at time of snapshot (per vori)
  goldPricePerVori: numeric("gold_price_per_vori", { precision: 15, scale: 2 }),
  silverPricePerVori: numeric("silver_price_per_vori", { precision: 15, scale: 2 }),

  // Gold/silver quantities in vori (for display)
  goldVori: numeric("gold_vori", { precision: 10, scale: 4 }),
  silverVori: numeric("silver_vori", { precision: 10, scale: 4 }),

  // Computed values (stored for historical accuracy)
  totalWealth: numeric("total_wealth", { precision: 15, scale: 2 }).notNull(),
  nisabThreshold: numeric("nisab_threshold", { precision: 15, scale: 2 }).notNull(),
  nisabMet: boolean("nisab_met").notNull(),

  currency: text("currency").default("BDT").notNull(),
  notes: text("notes"),

  snapshotDate: timestamp("snapshot_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Hawl cycles — tracks consecutive time above Nisab ───

export const hawlCycles = pgTable("hawl_cycles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),

  // State: "tracking" | "due" | "paid" | "reset"
  status: text("status").notNull().default("tracking"),

  // The snapshot that started this cycle
  startSnapshotId: uuid("start_snapshot_id")
    .references(() => assetSnapshots.id)
    .notNull(),

  // Hawl dates (Gregorian + Hijri)
  hawlStartDate: timestamp("hawl_start_date", { withTimezone: true }).notNull(),
  hawlStartHijri: text("hawl_start_hijri").notNull(),
  hawlDueDate: timestamp("hawl_due_date", { withTimezone: true }).notNull(),
  hawlDueHijri: text("hawl_due_hijri").notNull(),

  // When cycle ended (reset or paid)
  endDate: timestamp("end_date", { withTimezone: true }),

  // If reset, which snapshot caused it
  resetSnapshotId: uuid("reset_snapshot_id")
    .references(() => assetSnapshots.id),

  // Zakat obligation (set when status becomes "due")
  zakatAmount: numeric("zakat_amount", { precision: 15, scale: 2 }),
  wealthAtDue: numeric("wealth_at_due", { precision: 15, scale: 2 }),

  currency: text("currency").default("BDT").notNull(),
  notes: text("notes"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Individual zakat payments/distributions ───

export const zakatPayments = pgTable("zakat_payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  hawlCycleId: uuid("hawl_cycle_id")
    .references(() => hawlCycles.id, { onDelete: "cascade" })
    .notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  recipient: text("recipient"),
  category: text("category"),
  date: timestamp("date", { withTimezone: true }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations ───

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  assetSnapshots: many(assetSnapshots),
  hawlCycles: many(hawlCycles),
  zakatPayments: many(zakatPayments),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const assetSnapshotsRelations = relations(assetSnapshots, ({ one }) => ({
  user: one(users, {
    fields: [assetSnapshots.userId],
    references: [users.id],
  }),
}));

export const hawlCyclesRelations = relations(hawlCycles, ({ one, many }) => ({
  user: one(users, {
    fields: [hawlCycles.userId],
    references: [users.id],
  }),
  startSnapshot: one(assetSnapshots, {
    fields: [hawlCycles.startSnapshotId],
    references: [assetSnapshots.id],
    relationName: "startSnapshot",
  }),
  resetSnapshot: one(assetSnapshots, {
    fields: [hawlCycles.resetSnapshotId],
    references: [assetSnapshots.id],
    relationName: "resetSnapshot",
  }),
  payments: many(zakatPayments),
}));

export const zakatPaymentsRelations = relations(zakatPayments, ({ one }) => ({
  user: one(users, {
    fields: [zakatPayments.userId],
    references: [users.id],
  }),
  hawlCycle: one(hawlCycles, {
    fields: [zakatPayments.hawlCycleId],
    references: [hawlCycles.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AssetSnapshot = typeof assetSnapshots.$inferSelect;
export type NewAssetSnapshot = typeof assetSnapshots.$inferInsert;
export type HawlCycle = typeof hawlCycles.$inferSelect;
export type NewHawlCycle = typeof hawlCycles.$inferInsert;
export type ZakatPayment = typeof zakatPayments.$inferSelect;
export type NewZakatPayment = typeof zakatPayments.$inferInsert;
