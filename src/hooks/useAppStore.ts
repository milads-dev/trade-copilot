import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Store {
  selectedTagType: string;
  selectedTagId: number | null;
  updateTagType: (text: string) => void;
  updateTagId: (id: number | null) => void;
  tradeHistoryUrl: string;
  updateTradeHistoryUrl: (url: string) => void;
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
    }),
    {
      name: "selectedTagType-storage",
    }
  )
);
