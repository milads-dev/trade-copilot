import type {
  SeriesMarkerPosition,
  SeriesMarkerShape,
  UTCTimestamp,
} from "lightweight-charts";
import moment from "moment";

import type { DailyTrades, Tag, TagDetail, TradeTags } from "../type";

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

export const timeToLocal = (originalTime: string) => {
  const utcDate = new Date(originalTime);
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

export const formatDateForDetails = (date: string): string => {
  return moment(date).format("dddd MMMM Do YYYY");
};

export const generateMarkers = (
  dailyTrades: DailyTrades,
  timeFrame: number
) => {
  return (
    dailyTrades.map((trade) => ({
      time: subtractMinutesFromUnixTime(
        trade.Marker,
        timeFrame
      ) as UTCTimestamp,
      position: "aboveBar" as SeriesMarkerPosition,
      color: trade.Volume > 0 ? GREEN_MARKER : RED_MARKER,
      shape: "arrowDown" as SeriesMarkerShape,
      text: `${trade.Volume} x ${trade.Price}`,
    })) ?? []
  );
};

const subtractMinutesFromUnixTime = (
  unixTime: number,
  minutes: number
): number => {
  if (minutes == 1) return unixTime;

  const milliseconds = unixTime * 1000;
  const newMilliseconds = milliseconds - minutes * 60 * 1000;
  return Math.floor(newMilliseconds / 1000);
};

export const formatTradeTags = (data: Tag[]): TradeTags => {
  return data.reduce<TradeTags>(
    (result, tag) => {
      const { id, name, type } = tag;
      const newItem: TagDetail = { value: name, label: name, id, type };

      if (type === "setup") {
        result.setup.push(newItem);
      }
      if (type === "mistake") {
        result.mistake.push(newItem);
      }
      if (type === "custom") {
        result.custom.push(newItem);
      }

      return result;
    },
    { setup: [], mistake: [], custom: [] }
  );
};
