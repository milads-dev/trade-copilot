import type { AppRouter } from "~/server/api/root";

import type { inferRouterOutputs } from "@trpc/server";

import type {
  SeriesMarkerPosition,
  SeriesMarkerShape,
  UTCTimestamp,
} from "lightweight-charts";
import moment from "moment";

type RouterOutput = inferRouterOutputs<AppRouter>;
type DailyTrades = RouterOutput["trades"]["getTradesByDate"];

const MILLISECONDS = 1000;

const GREEN_MARKER = "#4bAF59";
const RED_MARKER = "#ff0419";

export const getMarketTimes = (date: string) => {
  const marketOpenTime = "9:30:00";
  const marketCloseTime = "16:00:00";

  const marketOpen =
    new Date(`${date} ${marketOpenTime}`).getTime() / MILLISECONDS;
  const marketClose =
    new Date(`${date} ${marketCloseTime}`).getTime() / MILLISECONDS;

  return { marketOpen, marketClose };
};

export const timeToLocal = (originalTime: number) => {
  const utcDate = new Date(originalTime * MILLISECONDS);
  return (Date.UTC(
    utcDate.getFullYear(),
    utcDate.getMonth(),
    utcDate.getDate(),
    utcDate.getHours(),
    utcDate.getMinutes(),
    utcDate.getSeconds(),
    utcDate.getMilliseconds()
  ) / 1000) as UTCTimestamp;
};

export const formatToUnix = (timestamp: string) =>
  moment(timestamp).startOf("minute").valueOf() / MILLISECONDS;

export const generateMarkers = ({ dailyTrades }: DailyTrades) => {
  return (
    dailyTrades?.map((trade) => ({
      time: trade.Marker as UTCTimestamp,
      position: "aboveBar" as SeriesMarkerPosition,
      color: trade.Volume > 0 ? GREEN_MARKER : RED_MARKER,
      shape: "arrowDown" as SeriesMarkerShape,
      text: `${trade.Volume} x ${trade.Price}`,
    })) ?? []
  );
};
