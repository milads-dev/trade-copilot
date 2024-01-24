import React from "react";

import { useRouter } from "next/router";

import { ChartLineDown, ChartLineUp, HeartIcon } from "~/components/icons";
import { api } from "~/utils/api";

import { calculateTradeStats } from "../utils/helper";

export const TradeStats = () => {
  const router = useRouter();
  const startDate = router.query.from as string;
  const endDate = router.query.to as string;

  const { data } = api.trades.getStats.useQuery(
    { startDate, endDate },
    {
      refetchOnWindowFocus: false,
    }
  );
  const tradeStats = data?.tradeStats ?? [];
  const result = calculateTradeStats(tradeStats);

  return (
    <div className="stats stats-vertical w-[35rem] self-end bg-base-200 md:stats-horizontal  md:w-[70rem]">
      <div className="stat">
        <div
          className={`stat-figure ${
            result?.totalProfitOrLoss && result.totalProfitOrLoss > 0
              ? "text-primary"
              : "text-error"
          }`}
        >
          <HeartIcon />
        </div>
        <div className="stat-title">Total P&L</div>
        {result?.totalProfitOrLoss ? (
          <>
            <div
              className={`stat-value ${
                result?.totalProfitOrLoss && result.totalProfitOrLoss > 0
                  ? "text-primary"
                  : "text-error"
              }`}
            >
              {result?.totalProfitOrLoss.toFixed(2)}
            </div>
            <div className="stat-desc">
              {tradeStats?.length === 0
                ? "N/A"
                : tradeStats?.length === 1
                ? `${tradeStats?.length} Trade`
                : `${tradeStats?.length} Trades`}
            </div>
          </>
        ) : (
          <div className="h-9 w-32 animate-pulse bg-slate-700" />
        )}
      </div>

      <div className="stat">
        <div className="stat-figure text-primary">
          <span
            className="tooltip tooltip-left"
            data-tip={
              result?.averageProfit && tradeStats?.length
                ? `Total Profit ${(
                    result?.averageProfit * tradeStats?.length
                  ).toFixed(2)}`
                : "N/A"
            }
          >
            <ChartLineUp />
          </span>
        </div>
        <div className="stat-title">Avg Win</div>
        {result?.averageProfit ? (
          <>
            <div className="stat-value text-secondary">
              {result?.averageProfit.toFixed(2)}
            </div>
            <div className="stat-desc">
              {result?.totalWins === 0
                ? "N/A"
                : `${result?.totalWins} ${
                    result?.totalWins === 1 ? "Win" : "Wins"
                  }`}
            </div>
          </>
        ) : (
          <div className="h-9 w-32 animate-pulse bg-slate-700" />
        )}
      </div>

      <div className="stat">
        <div className="stat-figure text-error">
          <span
            className="tooltip tooltip-left"
            data-tip={
              result?.averageLoss && tradeStats?.length
                ? `Total Loss ${(
                    result?.averageLoss * tradeStats?.length
                  ).toFixed(2)}`
                : "N/A"
            }
          >
            <ChartLineDown />
          </span>
        </div>
        <div className="stat-title">Avg Loss</div>
        {result?.averageLoss ? (
          <>
            <div className="stat-value text-error">
              {result?.averageLoss.toFixed(2)}
            </div>
            <div className="stat-desc">
              {result?.totalLosses === 0
                ? "N/A"
                : `${result?.totalLosses} ${
                    result?.totalLosses === 1 ? "Loss" : "Losses"
                  }`}
            </div>
          </>
        ) : (
          <div className="h-9 w-32 animate-pulse bg-slate-700" />
        )}
      </div>
    </div>
  );
};
