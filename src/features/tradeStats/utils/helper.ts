import type { RouterOutputs } from "~/utils/api";

import { type Time } from "lightweight-charts";
import moment from "moment";

export type DailyTrades = RouterOutputs["trades"]["getStats"]["tradeStats"];
export type AreaData = RouterOutputs["trades"]["getStats"]["areaData"];

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

export const calculateAreaChartLine = (data: AreaData) => {
  let accumulatedPnL = 0;

  if (!data || data.length === 0) {
    return [];
  }

  return [
    { value: 0, time: (data[0]!.time - 86400) as Time },
    ...data.map((item) => {
      accumulatedPnL += item.value;
      return { value: accumulatedPnL, time: item.time as Time };
    }),
  ];
};

export const generateTagQuery = (
  startDate: string | null | undefined,
  endDate: string | null | undefined
): string => {
  const formatStartDate = startDate
    ? moment(startDate, "MM/DD/YYYY").format("YYYY-MM-DD")
    : null;
  const formatEndDate = endDate
    ? moment(endDate, "MM/DD/YYYY").format("YYYY-MM-DD")
    : null;

  let query = `SELECT ttr."tagId", t."name" AS name, t."type", COUNT(ttr."tagId")::INTEGER AS count
    FROM "TradeTagRelation" ttr 
    JOIN "Tag" t ON ttr."tagId" = t."id"`;

  if (formatStartDate && formatEndDate) {
    query += ` WHERE ttr."date" BETWEEN '${formatStartDate}' AND '${formatEndDate}'`;
  }

  query += ' GROUP BY ttr."tagId", t."name", t."type" ';

  return query;
};

export const generateTagDateRangeQuery = (
  startDate: string,
  endDate: string,
  userId: string
): string => {
  const formatStartDate = moment(startDate, "MM/DD/YYYY").format("YYYY-MM-DD");
  const formatEndDate = moment(endDate, "MM/DD/YYYY").format("YYYY-MM-DD");
  const query = `SELECT ttr."date", t."name" AS name, t."type"
FROM "TradeTagRelation" ttr 
JOIN "Tag" t ON ttr."tagId" = t."id"
WHERE ttr."date" BETWEEN '${formatStartDate}' AND '${formatEndDate}' 
AND ttr."userId" = '${userId}'
GROUP BY ttr."date", t."name", t."type" 
`;
  return query;
};
