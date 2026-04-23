import { type Mode, type TradeLeg } from "~/features/market-analysis/types";

import { create } from "zustand";

interface AnalyzerStore {
  mode: Mode;
  legs: TradeLeg[];
  runningQty: number;
  avgEntryPrice: number;
  reset: () => void;
  pendingLeg: { qty: number; type: null | "LONG" | "SHORT" };
  armChart: (type: "LONG" | "SHORT", qty: number, mode: Mode) => void;
  completeLeg: (price: number, time: number) => void;
  cancelArm: () => void;
}

export const useAnalyzerStore = create<AnalyzerStore>((set) => ({
  mode: "IDLE",
  legs: [],
  runningQty: 0,
  avgEntryPrice: 0,
  pendingLeg: { qty: 1, type: null },
  cancelArm: () =>
    set({
      mode: "IDLE",
      pendingLeg: { type: null, qty: 1 },
    }),
  armChart: (type: "LONG" | "SHORT", qty: number, mode: Mode) =>
    set({
      mode: mode,
      pendingLeg: { type, qty },
    }),

  completeLeg: (price, time) =>
    set((state) => {
      const { type, qty } = state.pendingLeg;
      if (!type) return state;

      const prevQty = state.runningQty;
      const lastLeg = state.legs[state.legs.length - 1];
      if (lastLeg && time <= lastLeg.time) {
        console.error("Invalid timestamp. Leg must be after last trade.");
        return { ...state, mode: "IDLE" };
      }
      const isReducing =
        (prevQty > 0 && type === "SHORT") || (prevQty < 0 && type === "LONG");
      if (isReducing && qty > Math.abs(prevQty)) {
        console.error(
          `Cannot ${type} ${qty} with only ${Math.abs(prevQty)} open.`
        );
        return { ...state, mode: "IDLE" };
      }

      const change = type === "LONG" ? qty : -qty;
      const newRunningQty = Number((prevQty + change).toFixed(4));

      let label = "";
      let pnl = 0;
      let newAvgPrice = state.avgEntryPrice;

      if (prevQty === 0) {
        label = `Entry ${type}`;
        newAvgPrice = price;
      } else if (
        (prevQty > 0 && type === "LONG") ||
        (prevQty < 0 && type === "SHORT")
      ) {
        label = `Add ${type}`;
        const currentVal = prevQty * state.avgEntryPrice;
        const newVal = qty * price;
        newAvgPrice = (currentVal + newVal) / Math.abs(newRunningQty);
      } else {
        pnl =
          prevQty > 0
            ? (price - state.avgEntryPrice) * qty
            : (state.avgEntryPrice - price) * qty;

        if (newRunningQty === 0) {
          label = `Close ${type}`;
          newAvgPrice = 0;
        } else {
          label = `Trim ${type}`;
        }
      }

      const newLeg = { type, qty, price, time, label, pnl };

      return {
        legs: [...state.legs, newLeg],
        runningQty: newRunningQty,
        avgEntryPrice: newAvgPrice,
        mode: "IDLE",
        pendingLeg: { ...state.pendingLeg, type: null },
      };
    }),

  reset: () =>
    set({
      legs: [],
      mode: "IDLE",
      runningQty: 0,
      avgEntryPrice: 0,
      pendingLeg: { qty: 1, type: null },
    }),
}));
