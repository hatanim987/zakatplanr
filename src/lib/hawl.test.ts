import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { HawlCycle, AssetSnapshot } from "@/db/schema";
import {
  calculateDaysElapsed,
  isHawlComplete,
  isSnapshotStale,
  computeHawlState,
  computeOutstandingState,
  STALE_DAYS,
} from "./hawl";

// Helper to create a mock HawlCycle
function makeCycle(overrides: Partial<HawlCycle> = {}): HawlCycle {
  return {
    id: "cycle-1",
    status: "tracking",
    startSnapshotId: "snap-1",
    hawlStartDate: new Date("2024-12-13"),
    hawlStartHijri: "1446-06-12",
    hawlDueDate: new Date("2025-12-03"),
    hawlDueHijri: "1447-06-12",
    endDate: null,
    resetSnapshotId: null,
    zakatAmount: null,
    wealthAtDue: null,
    currency: "BDT",
    notes: null,
    createdAt: new Date("2024-12-13"),
    updatedAt: new Date("2024-12-13"),
    ...overrides,
  };
}

// Helper to create a mock AssetSnapshot
function makeSnapshot(overrides: Partial<AssetSnapshot> = {}): AssetSnapshot {
  return {
    id: "snap-1",
    cashAndBank: "100000",
    gold: "2000000",
    silver: "0",
    businessAssets: "0",
    stocks: "0",
    otherInvestments: "0",
    receivables: "0",
    liabilities: "0",
    goldPricePerVori: "120000",
    silverPricePerVori: null,
    goldVori: "6.5",
    silverVori: null,
    totalWealth: "2100000",
    nisabThreshold: "1875000",
    nisabMet: true,
    currency: "BDT",
    notes: null,
    snapshotDate: new Date("2025-02-09"),
    createdAt: new Date("2025-02-09"),
    ...overrides,
  };
}

describe("calculateDaysElapsed", () => {
  it("returns 0 for same date", () => {
    const date = new Date("2025-01-01");
    expect(calculateDaysElapsed(date, date)).toBe(0);
  });

  it("calculates correct number of days", () => {
    const start = new Date("2025-01-01");
    const end = new Date("2025-01-31");
    expect(calculateDaysElapsed(start, end)).toBe(30);
  });

  it("returns 0 when now is before start", () => {
    const start = new Date("2025-06-01");
    const now = new Date("2025-01-01");
    expect(calculateDaysElapsed(start, now)).toBe(0);
  });

  it("handles large date ranges", () => {
    const start = new Date("2024-01-01");
    const end = new Date("2025-01-01");
    expect(calculateDaysElapsed(start, end)).toBe(366); // 2024 is leap year
  });
});

describe("isHawlComplete", () => {
  it("returns true when now is after due date", () => {
    const dueDate = new Date("2025-12-03");
    const now = new Date("2026-02-09");
    expect(isHawlComplete(dueDate, now)).toBe(true);
  });

  it("returns true when now equals due date", () => {
    const dueDate = new Date("2025-12-03");
    expect(isHawlComplete(dueDate, dueDate)).toBe(true);
  });

  it("returns false when now is before due date", () => {
    const dueDate = new Date("2025-12-03");
    const now = new Date("2025-06-01");
    expect(isHawlComplete(dueDate, now)).toBe(false);
  });
});

describe("isSnapshotStale", () => {
  it("returns false when snapshot is recent", () => {
    const recent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    expect(isSnapshotStale(recent)).toBe(false);
  });

  it("returns true when snapshot is older than STALE_DAYS", () => {
    const old = new Date(Date.now() - (STALE_DAYS + 1) * 24 * 60 * 60 * 1000);
    expect(isSnapshotStale(old)).toBe(true);
  });

  it("returns true at exactly STALE_DAYS", () => {
    const exactlyStale = new Date(
      Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000
    );
    expect(isSnapshotStale(exactlyStale)).toBe(true);
  });

  it("respects custom staleDays parameter", () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    expect(isSnapshotStale(fiveDaysAgo, 3)).toBe(true);
    expect(isSnapshotStale(fiveDaysAgo, 10)).toBe(false);
  });
});

describe("computeHawlState", () => {
  it("returns idle status when no cycle exists", () => {
    const state = computeHawlState(null, null);
    expect(state.status).toBe("idle");
    expect(state.cycleId).toBeNull();
    expect(state.daysElapsed).toBe(0);
    expect(state.progressPercent).toBe(0);
  });

  it("returns idle with stale=true when no snapshot", () => {
    const state = computeHawlState(null, null);
    expect(state.isStale).toBe(true);
    expect(state.lastSnapshotDate).toBeNull();
  });

  it("computes tracking state correctly", () => {
    const cycle = makeCycle({ status: "tracking" });
    const snapshot = makeSnapshot();

    // Fix "now" to a known date midway through the cycle
    const state = computeHawlState(cycle, snapshot);

    expect(state.status).toBe("tracking");
    expect(state.cycleId).toBe("cycle-1");
    expect(state.hawlStartDate).toEqual(new Date("2024-12-13"));
    expect(state.hawlDueDate).toEqual(new Date("2025-12-03"));
    expect(state.totalDays).toBeGreaterThan(350);
    expect(state.progressPercent).toBeGreaterThanOrEqual(0);
    expect(state.progressPercent).toBeLessThanOrEqual(100);
  });

  it("computes due state with zakat amount", () => {
    const cycle = makeCycle({
      status: "due",
      zakatAmount: "65625.00",
      wealthAtDue: "2625000.00",
    });
    const snapshot = makeSnapshot();

    const state = computeHawlState(cycle, snapshot);

    expect(state.status).toBe("due");
    expect(state.zakatAmount).toBe(65625);
    expect(state.progressPercent).toBe(100); // Due = complete
  });

  it("caps daysElapsed at totalDays", () => {
    const cycle = makeCycle({
      status: "due",
      zakatAmount: "65625.00",
    });
    const snapshot = makeSnapshot();

    const state = computeHawlState(cycle, snapshot);

    expect(state.daysElapsed).toBeLessThanOrEqual(state.totalDays);
    expect(state.daysRemaining).toBe(0);
  });

  it("returns last snapshot date", () => {
    const snapshotDate = new Date("2025-02-09");
    const snapshot = makeSnapshot({ snapshotDate });

    const state = computeHawlState(null, snapshot);
    expect(state.lastSnapshotDate).toEqual(snapshotDate);
  });
});

describe("computeOutstandingState", () => {
  it("returns zero for empty array", () => {
    const result = computeOutstandingState([]);
    expect(result.totalOutstanding).toBe(0);
    expect(result.cycles).toHaveLength(0);
  });

  it("computes outstanding for single due cycle", () => {
    const result = computeOutstandingState([
      {
        id: "cycle-1",
        hawlStartDate: new Date("2024-12-13"),
        hawlDueDate: new Date("2025-12-03"),
        hawlStartHijri: "1446-06-12",
        zakatAmount: "65625.00",
        totalPaid: "25000.00",
        currency: "BDT",
      },
    ]);

    expect(result.totalOutstanding).toBe(40625);
    expect(result.cycles).toHaveLength(1);
    expect(result.cycles[0].remaining).toBe(40625);
    expect(result.cycles[0].zakatAmount).toBe(65625);
    expect(result.cycles[0].totalPaid).toBe(25000);
  });

  it("computes outstanding for multiple due cycles", () => {
    const result = computeOutstandingState([
      {
        id: "cycle-1",
        hawlStartDate: new Date("2023-12-13"),
        hawlDueDate: new Date("2024-12-03"),
        hawlStartHijri: "1445-06-12",
        zakatAmount: "50000.00",
        totalPaid: "50000.00", // Fully paid
        currency: "BDT",
      },
      {
        id: "cycle-2",
        hawlStartDate: new Date("2024-12-03"),
        hawlDueDate: new Date("2025-11-22"),
        hawlStartHijri: "1446-06-12",
        zakatAmount: "65625.00",
        totalPaid: "20000.00",
        currency: "BDT",
      },
      {
        id: "cycle-3",
        hawlStartDate: new Date("2025-11-22"),
        hawlDueDate: new Date("2026-11-11"),
        hawlStartHijri: "1447-06-12",
        zakatAmount: "70000.00",
        totalPaid: "0",
        currency: "BDT",
      },
    ]);

    // cycle-1: fully paid → remaining 0
    // cycle-2: 65625 - 20000 = 45625
    // cycle-3: 70000 - 0 = 70000
    expect(result.totalOutstanding).toBe(0 + 45625 + 70000);
    expect(result.cycles).toHaveLength(3);
    expect(result.cycles[0].remaining).toBe(0);
    expect(result.cycles[1].remaining).toBe(45625);
    expect(result.cycles[2].remaining).toBe(70000);
  });

  it("handles null zakatAmount gracefully", () => {
    const result = computeOutstandingState([
      {
        id: "cycle-1",
        hawlStartDate: new Date("2024-12-13"),
        hawlDueDate: new Date("2025-12-03"),
        hawlStartHijri: "1446-06-12",
        zakatAmount: null,
        totalPaid: "0",
        currency: "BDT",
      },
    ]);

    expect(result.totalOutstanding).toBe(0);
    expect(result.cycles[0].zakatAmount).toBe(0);
    expect(result.cycles[0].remaining).toBe(0);
  });

  it("never returns negative remaining", () => {
    const result = computeOutstandingState([
      {
        id: "cycle-1",
        hawlStartDate: new Date("2024-12-13"),
        hawlDueDate: new Date("2025-12-03"),
        hawlStartHijri: "1446-06-12",
        zakatAmount: "10000.00",
        totalPaid: "15000.00", // Overpaid
        currency: "BDT",
      },
    ]);

    expect(result.cycles[0].remaining).toBe(0);
    expect(result.totalOutstanding).toBe(0);
  });
});
