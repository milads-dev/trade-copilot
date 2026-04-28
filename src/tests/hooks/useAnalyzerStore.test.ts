import { useAnalyzerStore } from "~/hooks/market-analysis/useAnalyzerStore";

describe("Market Analyzer Store Tests", () => {
  const getStore = () => useAnalyzerStore.getState();

  beforeEach(() => {
    getStore().reset();
  });

  describe("Trade Order Entry Logic", () => {
    test("should calculate weighted average on multiple buys", () => {
      const store = getStore();

      store.armChart("LONG", 1, "AWAITING_ENTRY");
      store.completeLeg(100, 1000);

      store.armChart("LONG", 1, "AWAITING_ENTRY");
      store.completeLeg(120, 2000);

      const state = getStore();
      expect(state.runningQty).toBe(2);
      expect(state.avgEntryPrice).toBe(110);
    });

    test("should handle short position PnL correctly", () => {
      const store = getStore();

      store.armChart("SHORT", 1, "AWAITING_ENTRY");
      store.completeLeg(200, 1000);

      store.armChart("LONG", 1, "AWAITING_TRIM");
      store.completeLeg(150, 2000);

      const state = getStore();
      expect(state.runningQty).toBe(0);
      expect(state.legs[1]!.pnl).toBe(50);
    });
  });

  describe("The Bouncer (Validation)", () => {
    test("should reject trades that would cause a position direction change", () => {
      const store = getStore();

      store.armChart("LONG", 2, "AWAITING_ENTRY");
      store.completeLeg(100, 1000);

      store.armChart("SHORT", 5, "AWAITING_TRIM");
      store.completeLeg(110, 2000);

      const state = getStore();
      expect(state.runningQty).toBe(2);
      expect(state.legs.length).toBe(1);
    });

    test("should reject trades with invalid sequential timestamps", () => {
      const store = getStore();

      store.armChart("LONG", 1, "AWAITING_ENTRY");
      store.completeLeg(100, 5000);

      store.armChart("LONG", 1, "AWAITING_ENTRY");
      store.completeLeg(110, 4000);

      expect(getStore().legs.length).toBe(1);
    });
  });
});
