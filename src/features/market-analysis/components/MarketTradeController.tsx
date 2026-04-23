import React, { useState } from "react";

import { useAnalyzerStore } from "~/hooks/useAnalyzerStore";

export const MarketTradeController = () => {
  const runningQty = useAnalyzerStore((state) => state.runningQty);
  const mode = useAnalyzerStore((state) => state.mode);
  const pendingType = useAnalyzerStore((state) => state.pendingLeg.type);
  const tradeLegs = useAnalyzerStore((state) => state.legs);

  const armChart = useAnalyzerStore((state) => state.armChart);
  const resetTradeLedger = useAnalyzerStore((state) => state.reset);

  const [quantity, setQuantity] = useState(1);

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setQuantity(val > 0 ? val : 1);
  };

  return (
    <section className="space-y-4 bg-base-200 shadow-sm p-4 rounded-xl">
      <div className="flex flex-col gap-3">
        <label className="w-full form-control">
          <div className="label">
            <span className="font-semibold label-text">
              Trade Name (optional)
            </span>
          </div>
          <input
            type="text"
            placeholder="Enter Trade"
            className="w-full input input-bordered input-sm"
          />
        </label>

        <label className="w-full form-control">
          <div className="label">
            <span className="font-semibold label-text">Quantity</span>
          </div>
          <input
            type="number"
            value={quantity}
            onChange={handleQtyChange}
            className="w-full input input-bordered input-sm"
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <div className="gap-2 grid grid-cols-2">
          <button
            disabled={runningQty === 0 && tradeLegs.length !== 0}
            className={`btn btn-success btn-outline btn-sm text-white transition-all focus:outline-none ${
              mode === "AWAITING_ENTRY" && pendingType === "LONG"
                ? "animate-pulse"
                : ""
            }`}
            onClick={() => armChart("LONG", quantity, "AWAITING_ENTRY")}
          >
            BUY +{quantity}
          </button>
          <button
            disabled={runningQty === 0 && tradeLegs.length !== 0}
            className={`btn btn-error btn-outline btn-sm text-white transition-all focus:outline-none ${
              mode === "AWAITING_ENTRY" && pendingType === "SHORT"
                ? "animate-pulse"
                : ""
            }`}
            onClick={() => armChart("SHORT", quantity, "AWAITING_ENTRY")}
          >
            SELL -{quantity}
          </button>
        </div>

        <div className="gap-2 grid grid-cols-2">
          <button
            className="btn-outline btn btn-error btn-sm"
            onClick={() => resetTradeLedger()}
            disabled={runningQty === 0 && tradeLegs.length === 0}
          >
            CANCEL
          </button>
          <button
            className="btn-outline btn btn-ghost btn-sm"
            onClick={() =>
              armChart(
                runningQty > 0 ? "SHORT" : "LONG",
                Math.abs(runningQty),
                "AWAITING_CLOSE"
              )
            }
            disabled={runningQty === 0}
          >
            CLOSE
          </button>
        </div>
      </div>
    </section>
  );
};
