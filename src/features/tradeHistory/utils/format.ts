import moment from "moment";

import {
  type dataBaseTradeArrayType,
  ibkrCsvSchema,
  metaTraderCsvSchema,
} from "../types";
import { isIbkrCsv, isMetaTraderCsv } from "./validation";

const ORDER_TYPE = "sell";
const DIFFERNCE_IN_TIMEZONE = 7;

export const formatTradeCsvData = (data: unknown[]) => {
  if (isMetaTraderCsv(data)) {
    return data.map((tradeRow) => formatMetaTraderData(tradeRow));
  } else if (isIbkrCsv(data)) {
    return data.map((tradeRow) => formatIbkrData(tradeRow));
  } else return data;
};

const formatMetaTraderData = (tradeRow: typeof metaTraderCsvSchema) => {
  const validRow = metaTraderCsvSchema.parse(tradeRow);

  const date = moment(validRow.Time, "YYYY.MM.DD HH:mm:ss").subtract(
    DIFFERNCE_IN_TIMEZONE,
    "hours"
  );
  const formattedDate = date.format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
  return {
    Symbol: validRow.Symbol,
    TimeStamp: formattedDate,
    Price: validRow.Price,
    Profit: validRow.Profit,
    Volume: validRow.Type === ORDER_TYPE ? -validRow.Volume : validRow.Volume,
  };
};

const formatIbkrData = (tradeRow: typeof ibkrCsvSchema) => {
  const validRow = ibkrCsvSchema.parse(tradeRow);
  const date = moment(validRow.DateTime, "MM/DD/YYYY,HH:mm:ss");
  const formattedDate = date.format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
  return {
    Symbol: validRow.Symbol,
    TimeStamp: formattedDate,
    Price: validRow.TradePrice,
    Profit: validRow.FifoPnlRealized,
    Volume: validRow.Quantity,
  };
};

type DailyTrade = {
  Symbol: string;
  Profit: number;
  openTimeStamp: string;
  closeTimeStamp: string | null;
};

export const processDailyTrades = (trades: dataBaseTradeArrayType) => {
  return trades.reduce<DailyTrade[]>((dailyTrades, currentTrade) => {
    const { Symbol, Profit, TimeStamp } = currentTrade;
    const lastTrade = dailyTrades[dailyTrades.length - 1];

    if (
      !lastTrade ||
      lastTrade.Symbol !== Symbol ||
      !lastTrade.openTimeStamp?.startsWith(TimeStamp.substring(0, 10))
    ) {
      // Add a new trade
      dailyTrades.push({
        Symbol,
        Profit,
        openTimeStamp: TimeStamp,
        closeTimeStamp: null,
      });
    } else {
      // Update the existing trade
      lastTrade.Profit += Profit;
      lastTrade.closeTimeStamp = TimeStamp;
    }

    return dailyTrades;
  }, []);
};

export const formatUtcTimestamp = (utcTimestamp: Date) => {
  return moment.utc(utcTimestamp).format("YYYY-MM-DD HH:mm:ss");
};
