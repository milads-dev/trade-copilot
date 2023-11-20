import { type UTCTimestamp } from "lightweight-charts";
import moment from "moment";

const MILLISECONDS = 1000;

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
