import type { RouterOutputs } from "~/utils/api";

import { type Time } from "lightweight-charts";
import moment from "moment";

import { type TradeTag } from "../types";

export type TradeStats = RouterOutputs["trades"]["getStats"]["tradeStats"];
export type AreaData = RouterOutputs["trades"]["getStats"]["areaData"];
type Tags = RouterOutputs["tags"]["getTagsByDateRange"]["tags"];

export const calculateTradeStats = (data: TradeStats | undefined) => {
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
  endDate: string | null | undefined,
  userId: string
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
    query += ` WHERE ttr."date" BETWEEN '${formatStartDate}' AND '${formatEndDate}' 
    AND  ttr."userId" = '${userId}'`;
  } else {
    query += `WHERE ttr."userId" = '${userId}'`;
  }

  query += 'GROUP BY ttr."tagId", t."name", t."type" ';

  return query;
};

export const generateTagDateRangeQuery = (
  startDate: string,
  endDate: string,
  userId: string
): string => {
  const formatStartDate = moment(startDate, "MM/DD/YYYY").format("YYYY-MM-DD");
  const formatEndDate = moment(endDate, "MM/DD/YYYY").format("YYYY-MM-DD");
  const query = `SELECT ttr."date", t."name" AS name, t."type", t."id"
FROM "TradeTagRelation" ttr 
JOIN "Tag" t ON ttr."tagId" = t."id"
WHERE ttr."date" BETWEEN '${formatStartDate}' AND '${formatEndDate}' 
AND ttr."userId" = '${userId}'
GROUP BY ttr."date", t."name", t."type",t."id"
`;
  return query;
};

const typeWeights: Record<string, number> = {
  setup: 1,
  mistake: 2,
  custom: 3,
};

export const sortTradeTags = (tags: TradeTag[]) =>
  tags.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) {
      return dateA - dateB;
    }
    return (typeWeights[a.type] ?? 0) - (typeWeights[b.type] ?? 0);
  });

export const processCalendarTrades = (
  trades: TradeStats,
  currentTheme: string | null
) => {
  const sortedTrades = trades!.sort(
    (a, b) =>
      new Date(a.openTimeStamp).getTime() - new Date(b.openTimeStamp).getTime()
  );

  const totalProfit = sortedTrades.reduce(
    (accumulatedProfit, trade) => accumulatedProfit + trade.Profit,
    0
  );

  const firstTradeDate =
    sortedTrades.length > 0
      ? new Date(sortedTrades[0]!.openTimeStamp)
      : undefined;

  let highlightColor = "";

  if (currentTheme === "forest") {
    if (totalProfit > 0) {
      highlightColor = "bg-success-content";
    } else if (totalProfit < 0) {
      highlightColor = "bg-error-content";
    }
  } else {
    if (totalProfit > 0) {
      highlightColor = "bg-success";
    } else if (totalProfit < 0) {
      highlightColor = "bg-error";
    }
  }

  return {
    highlightColor,
    date: firstTradeDate,
    profit: totalProfit,
  };
};

const formatDate = (inputDate: Date | string) => {
  const date = new Date(inputDate);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
};
export const getTradeTags = (
  tags: Tags,
  selectedTagType: string,
  date?: Date
) => {
  return tags?.filter((tag) =>
    selectedTagType === "all"
      ? formatDate(date!).getTime() === formatDate(tag.date).getTime()
      : formatDate(date!).getTime() === formatDate(tag.date).getTime() &&
        tag.type === selectedTagType
  );
};

export const getTagClassName = (selectedTagType: string, tagType: string) => {
  if (selectedTagType !== "all") {
    return "";
  }

  switch (tagType) {
    case "setup":
      return "underline decoration-primary";
    case "mistake":
      return "underline decoration-error";
    case "custom":
      return "underline decoration-info";
    default:
      return "";
  }
};
