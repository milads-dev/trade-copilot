import type { RouterOutputs } from "~/utils/api";

export type DailyTrades = RouterOutputs["trades"]["getStats"];

export const calculateTradeStats = (data: DailyTrades | undefined) => {
  return data?.reduce(
    (accumulator, trade, currentIndex) => {
      accumulator.totalProfitOrLoss += trade.Profit;
      if (trade.Profit > 0) {
        accumulator.averageProfit += trade.Profit;
        accumulator.totalWins++;
      } else if (trade.Profit < 0) {
        accumulator.averageLoss += trade.Profit;
        accumulator.totalLosses++;
      }
      if (currentIndex + 1 === data.length) {
        accumulator.averageProfit = accumulator.averageProfit / data.length;
        accumulator.averageLoss = accumulator.averageLoss / data.length;
      }
      return accumulator;
    },
    {
      totalProfitOrLoss: 0,
      averageProfit: 0,
      averageLoss: 0,
      totalWins: 0,
      totalLosses: 0,
    }
  );
};
