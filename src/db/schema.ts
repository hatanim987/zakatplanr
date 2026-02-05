import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

// Zakat calculation periods (yearly)
export const zakatPeriods = pgTable("zakat_periods", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(), // e.g., "2025-2026"
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  // Wealth breakdown (nullable - user may skip calculation)
  cashAndBank: numeric("cash_and_bank", { precision: 15, scale: 2 }),
  gold: numeric("gold", { precision: 15, scale: 2 }),
  silver: numeric("silver", { precision: 15, scale: 2 }),
  businessAssets: numeric("business_assets", { precision: 15, scale: 2 }),
  stocks: numeric("stocks", { precision: 15, scale: 2 }),
  otherInvestments: numeric("other_investments", { precision: 15, scale: 2 }),
  receivables: numeric("receivables", { precision: 15, scale: 2 }), // debts owed to you
  liabilities: numeric("liabilities", { precision: 15, scale: 2 }), // debts you owe
  // Calculated or manually entered zakat amount
  totalWealth: numeric("total_wealth", { precision: 15, scale: 2 }),
  zakatAmount: numeric("zakat_amount", { precision: 15, scale: 2 }).notNull(),
  isManualEntry: boolean("is_manual_entry").default(false).notNull(),
  nisabMet: boolean("nisab_met").default(true).notNull(),
  currency: text("currency").default("BDT").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Individual zakat payments/distributions
export const zakatPayments = pgTable("zakat_payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  periodId: uuid("period_id")
    .references(() => zakatPeriods.id, { onDelete: "cascade" })
    .notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  recipient: text("recipient"), // who received the zakat
  category: text("category"), // poor, needy, zakat collector, etc.
  date: timestamp("date", { withTimezone: true }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Type exports
export type ZakatPeriod = typeof zakatPeriods.$inferSelect;
export type NewZakatPeriod = typeof zakatPeriods.$inferInsert;
export type ZakatPayment = typeof zakatPayments.$inferSelect;
export type NewZakatPayment = typeof zakatPayments.$inferInsert;
