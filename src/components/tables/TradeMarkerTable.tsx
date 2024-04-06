import React from "react";

import { type DailyTrades } from "~/features/tradeDetails";
import { formatUtcTimestamp } from "~/features/tradeHistory";
import { type ChartMarkerActions } from "~/hooks/useChartMarkers";

import { EyeClosedIcon, EyeOpenIcon } from "../icons";

interface Props {
  trades: DailyTrades;
  state: {
    markerGroups: DailyTrades[];
    selectedIndex: number | null;
    selectedMarkers: DailyTrades | null | undefined | "hidden";
  };
  dispatch: React.Dispatch<ChartMarkerActions>;
}

export const TradeMarkerTable = ({ trades, state, dispatch }: Props) => {
  const { selectedIndex, markerGroups, selectedMarkers } = state;

  const ICON_COLORS = [
    "text-primary",
    "text-secondary",
    "text-info",
    "text-success",
    "text-warning",
    "text-error",
  ];

  return (
    <div className="h-64 overflow-scroll">
      <table className="table table-zebra table-pin-rows">
        <thead className="">
          <tr>
            <th>Symbol</th>
            <th>Time</th>
            <th>Volume</th>
            <th>Price</th>
            <th>Profit</th>
            <th>
              <div className="dropdown-hover  dropdown dropdown-left">
                <div tabIndex={0} role="button">
                  {selectedMarkers === "hidden" ? (
                    <EyeClosedIcon
                      onClick={() => dispatch({ type: "HIDE_MARKERS" })}
                    />
                  ) : (
                    <EyeOpenIcon
                      onClick={() => dispatch({ type: "HIDE_MARKERS" })}
                      className={`${
                        selectedIndex !== null ? ICON_COLORS[selectedIndex] : ""
                      }`}
                    />
                  )}
                </div>
                <ul className="menu dropdown-content rounded-box z-30 -mt-4 mr-1 grid w-52 grid-cols-3 gap-4 bg-base-100 shadow">
                  {Array.from({ length: 6 }, (_, index) => (
                    <li key={index}>
                      <label className="swap">
                        <input
                          type="checkbox"
                          checked={selectedIndex === index}
                          onChange={(event) =>
                            dispatch({
                              type: "TOGGLE_MARKERS",
                              payload: {
                                index,
                                isChecked: event.target.checked,
                              },
                            })
                          }
                        />
                        <EyeClosedIcon
                          className={`swap-off ${ICON_COLORS[index]}`}
                        />

                        <EyeOpenIcon
                          className={`swap-on ${ICON_COLORS[index]}`}
                        />
                      </label>
                    </li>
                  ))}
                  <li className="col-span-3">
                    <button
                      className="btn content-center"
                      onClick={() => dispatch({ type: "RESET_STATE" })}
                    >
                      Reset
                    </button>
                  </li>
                </ul>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="">
          {trades.map((item, index) => (
            <tr key={index}>
              <td>{item.Symbol}</td>
              <td>{formatUtcTimestamp(item.TimeStamp)}</td>
              <td>{item.Volume}</td>
              <td>{item.Price}</td>
              <td>{item.Profit}</td>
              <td>
                <div className=" dropdown-hover  dropdown dropdown-left">
                  <div tabIndex={index} role="button">
                    <EyeOpenIcon
                      className={`${
                        selectedIndex !== null &&
                        markerGroups[selectedIndex]?.some(
                          (selectedMarker) =>
                            selectedMarker.Marker === item.Marker &&
                            selectedMarker.Price === item.Price
                        )
                          ? ICON_COLORS[selectedIndex]
                          : ""
                      }`}
                    />
                  </div>
                  <ul
                    tabIndex={index}
                    className="menu dropdown-content rounded-box z-30 -mt-4 mr-1 grid w-52 grid-cols-3 gap-4 bg-base-100 shadow"
                  >
                    {Array.from({ length: 6 }, (_, index) => (
                      <li key={index}>
                        <label className="swap">
                          <input
                            type="checkbox"
                            checked={markerGroups[index]?.some(
                              (selectedMarker) =>
                                selectedMarker.Marker === item.Marker &&
                                selectedMarker.Price === item.Price
                            )}
                            onChange={() =>
                              dispatch({
                                type: "TOGGLE_CHECKBOX",
                                payload: {
                                  item,
                                  index,
                                },
                              })
                            }
                          />
                          <EyeClosedIcon
                            className={`swap-off ${ICON_COLORS[index]}`}
                          />

                          <EyeOpenIcon
                            className={`swap-on ${ICON_COLORS[index]}`}
                          />
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
