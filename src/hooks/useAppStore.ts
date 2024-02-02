import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Store {
  selectedTagType: string;
  selectedTagId: number | null;
  updateTagType: (text: string) => void;
  updateTagId: (id: number | null) => void;
}

export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      selectedTagType: "setup",
      selectedTagId: null,
      updateTagType: (selectedTagType) => set({ selectedTagType }),
      updateTagId: (id: number | null) => set({ selectedTagId: id }),
    }),
    {
      name: "selectedTagType-storage",
    }
  )
);
