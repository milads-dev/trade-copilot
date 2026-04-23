import React from "react";

import { type TradeLeg } from "../types";

interface Props {
  legs: TradeLeg[];
}

export const TradeLedger = ({ legs }: Props) => {
  return (
    <section className="flex-1 p-4 border-[2px] border-base-200 border-dashed rounded-xl overflow-y-auto">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center opacity-50 px-2 font-bold text-[10px] uppercase">
          <span className="w-1/3">Type | Qty</span>
          <span className="flex justify-center items-center gap-1 w-1/3 text-center">
            <ClockIcon /> Time
          </span>
          <span className="w-1/3 text-right">Price | PnL</span>
        </div>

        {legs.length === 0 ? (
          <div className="opacity-30 py-10 text-xs text-center italic">
            No executions recorded yet.
          </div>
        ) : (
          legs.map((leg, index) => (
            <LedgerRow key={`${leg.time}-${index}`} leg={leg} />
          ))
        )}
      </div>
    </section>
  );
};

const LedgerRow = ({ leg }: { leg: TradeLeg }) => {
  console.log("🚀 ~ LedgerRow ~ leg:", leg);
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
      className={`flex items-center justify-between rounded-lg border p-3 ${getStyles()}`}
    >
      <div className="flex flex-col w-1/3">
        <span className="font-black text-[10px] italic uppercase leading-none">
          {leg.label}
        </span>
        <span className="font-mono font-bold text-base-content text-lg leading-tight">
          {leg.qty.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-center items-center w-1/3">
        <span className="bg-base-300 px-2 py-1 rounded-md font-mono font-semibold text-xs text-base-content">
          {formatTimestamp(leg.time)}
        </span>
      </div>

      <div className="flex flex-col items-end w-1/3">
        <span className="font-mono font-bold text-sm text-base-content">
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
    className="w-3 h-3"
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
    timeZone: "UTC",
  });
};
