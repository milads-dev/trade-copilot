import { create } from "zustand";

import { type RectangleParams } from "../components/charts/RecanglePrimitive";

export type DrawingMode = "IDLE" | "DRAW_RECTANGLE";

interface ChartDrawings {
  id: string;
  type: "RECTANGLE";
  params: RectangleParams;
  linkedLegId?: string;
  styles?: {
    fillColor: string;
    strokeColor: string;
  };
}

interface ChartDrawingsStore {
  mode: DrawingMode;
  drawings: ChartDrawings[];
  activeDrawingId: string | null;
  setMode: (mode: DrawingMode) => void;
  addRectangle: (params: RectangleParams) => string;
  updateDrawing: (id: string, partial: Partial<RectangleParams>) => void;
  deleteDrawing: (id: string) => void;
  linkToLeg: (drawingId: string, legId: string) => void;
  reset: () => void;
}

export const useChartDrawingsStore = create<ChartDrawingsStore>((set) => ({
  mode: "IDLE",
  drawings: [],
  activeDrawingId: null,

  setMode: (mode) => set({ mode }),

  addRectangle: (params) => {
    const id = crypto.randomUUID();
    const newDrawing: ChartDrawings = {
      id,
      type: "RECTANGLE",
      params,
    };

    set((state) => ({
      drawings: [...state.drawings, newDrawing],
      activeDrawingId: id,
    }));

    return id;
  },

  updateDrawing: (id, partial) =>
    set((state) => ({
      drawings: state.drawings.map((d) =>
        d.id === id ? { ...d, params: { ...d.params, ...partial } } : d
      ),
      activeDrawingId: null,
    })),

  deleteDrawing: (id) =>
    set((state) => ({
      drawings: state.drawings.filter((d) => d.id !== id),
      activeDrawingId:
        state.activeDrawingId === id ? null : state.activeDrawingId,
    })),

  linkToLeg: (drawingId, legId) =>
    set((state) => ({
      drawings: state.drawings.map((d) =>
        d.id === drawingId ? { ...d, linkedLegId: legId } : d
      ),
    })),

  reset: () =>
    set({
      drawings: [],
      mode: "IDLE",
      activeDrawingId: null,
    }),
}));
