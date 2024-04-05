import { type Reducer } from "react";

import { type DailyTrades } from "~/features/tradeDetails";

type State = {
  markerGroups: DailyTrades[];
  selectedIndex: number | null;
  selectedMarkers: DailyTrades | null | undefined | "hidden";
};

export type ChartMarkerActions =
  | { type: "RESET_STATE" }
  | { type: "HIDE_MARKERS" }
  | {
      type: "TOGGLE_CHECKBOX";
      payload: {
        item: DailyTrades[number];
        index: number;
      };
    }
  | {
      type: "TOGGLE_MARKERS";
      payload: { index: number; isChecked: boolean };
    };

const initialState: State = {
  markerGroups: Array.from({ length: 6 }, () => []),
  selectedIndex: null,
  selectedMarkers: undefined,
};

const reducer: Reducer<State, ChartMarkerActions> = (state, action) => {
  switch (action.type) {
    case "TOGGLE_CHECKBOX": {
      const { index, item } = action.payload;
      const updatedMarkerGroups = [...state.markerGroups];
      if (updatedMarkerGroups[index]) {
        const isSelected = updatedMarkerGroups[index]?.some(
          (selectedTrade) =>
            selectedTrade.Marker === item.Marker &&
            selectedTrade.Price === item.Price &&
            selectedTrade.Profit === item.Profit
        );
        if (isSelected) {
          updatedMarkerGroups[index] = updatedMarkerGroups[index]!.filter(
            (selectedTrade) =>
              selectedTrade.Marker !== item.Marker ||
              selectedTrade.Price !== item.Price ||
              selectedTrade.Profit !== item.Profit
          );
        } else {
          updatedMarkerGroups[index] = [
            ...(updatedMarkerGroups[index] ?? []),
            item,
          ];
        }
      } else {
        updatedMarkerGroups[index] = [item];
      }
      if (state.selectedIndex === index) {
        state.selectedMarkers = updatedMarkerGroups[index];
      }
      return { ...state, markerGroups: updatedMarkerGroups };
    }
    case "TOGGLE_MARKERS": {
      const { index, isChecked } = action.payload;
      const prevIndex = state.selectedIndex;
      return {
        ...state,
        selectedIndex: prevIndex === index ? null : index,
        selectedMarkers: isChecked ? state.markerGroups[index] : null,
      };
    }
    case "RESET_STATE": {
      return initialState;
    }
    case "HIDE_MARKERS": {
      const isHidden = state.selectedMarkers === "hidden";
      return {
        ...state,
        selectedMarkers: isHidden ? null : "hidden",
        selectedIndex: null,
      };
    }
    default:
      return state;
  }
};

export { initialState, reducer };
