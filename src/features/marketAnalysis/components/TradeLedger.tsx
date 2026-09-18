import React from "react";

import { type TradeLeg } from "../types";

interface Props {
  legs: TradeLeg[];
}

export const TradeLedger = ({ legs }: Props) => {
  return (
    <section className="flex-1 overflow-y-auto rounded-xl border-[2px] border-dashed border-base-200 p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase opacity-50">
          <span className="w-1/3">Type | Qty</span>
          <span className="flex w-1/3 items-center justify-center gap-1 text-center">
            <ClockIcon /> Time
          </span>
          <span className="w-1/3 text-right">Price | PnL</span>
        </div>

        <div className="h-[35rem] space-y-4 overflow-scroll">
          {legs.length === 0 ? (
            <div className="py-10 text-center text-xs italic opacity-30">
              No executions recorded yet.
            </div>
          ) : (
            legs.map((leg, index) => (
              <LedgerRow key={`${leg.time}-${index}`} leg={leg} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

const LedgerRow = ({ leg }: { leg: TradeLeg }) => {
  const isEntry = leg.label.includes("Entry");
  const isClose = leg.label.includes("Close");
  const isAdd = leg.label.includes("Add");
  const getStyles = () => {
    if (isEntry) return "bg-success/40 border-success/20 text-success";
    if (isAdd) return "bg-info/40 border-info/20 text-info";
    if (isClose) return "bg-error/40 border-error/20 text-error";
    return "bg-warning/40 border-warning/20 text-warning"; // Trims
  };

  return (
    <div
      className={`flex  items-center justify-between rounded-lg border  p-3 ${getStyles()}`}
    >
      <div className="flex w-1/3 flex-col">
        <span className="text-[10px] font-black uppercase italic leading-none">
          {leg.label}
        </span>
        <span className="font-mono text-lg font-bold leading-tight text-base-content">
          {leg.qty.toFixed(2)}
        </span>
      </div>

      <div className="flex w-1/3 items-center justify-center">
        <span className="rounded-md bg-base-300 px-2 py-1 font-mono text-xs font-semibold text-base-content">
          {formatTimestamp(leg.time)}
        </span>
      </div>

      <div className="flex w-1/3 flex-col items-end">
        <span className="font-mono text-sm font-bold text-base-content">
          ${leg.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
        {!isEntry && !isAdd && (
          <span
            className={`bg-base-100 px-1 text-xs font-bold ${
              leg.pnl >= 0 ? "text-success" : "text-error"
            }`}
          >
            {leg.pnl >= 0 ? "+" : ""}
            {leg.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        )}
      </div>
    </div>
  );
};

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="h-3 w-3"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
    />
  </svg>
);

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp * 1000);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/New_York",
  });
};
