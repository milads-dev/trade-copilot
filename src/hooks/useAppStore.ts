import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Store {
  selectedTagType: string;
  updateTagType: (text: string) => void;
  selectedTagId: number | null;
  updateTagId: (id: number | null) => void;
  tradeHistoryUrl: string;
  updateTradeHistoryUrl: (url: string) => void;
  hiddenPriceLineIds: number[];
  updateHiddenPriceLine: (number: number) => void;
}

export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      selectedTagType: "setup",
      selectedTagId: null,
      updateTagType: (selectedTagType) => set({ selectedTagType }),
      updateTagId: (selectedTagId: number | null) => set({ selectedTagId }),
      tradeHistoryUrl: "",
      updateTradeHistoryUrl: (tradeHistoryUrl) => set({ tradeHistoryUrl }),
      hiddenPriceLineIds: [],
      updateHiddenPriceLine: (number) =>
        set((state) => {
          const updatedData = state.hiddenPriceLineIds.includes(number)
            ? state.hiddenPriceLineIds.filter((n) => n !== number)
            : [...state.hiddenPriceLineIds, number];

          return { hiddenPriceLineIds: updatedData };
        }),
    }),
    {
      name: "tradeCopilot-storage",
    }
  )
);
