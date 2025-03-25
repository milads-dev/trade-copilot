import moment from "moment";
import { type z } from "zod";

import {
  type TradeDetailsData,
  type dataBaseTradeArrayType,
  type ibkrArrayCsvSchema,
  ibkrCsvSchema,
  type metaTraderArrayCsvSchema,
  metaTraderCsvSchema,
  type topStepArrayCsvSchema,
} from "../types";

type topStepTradeType = z.infer<typeof topStepArrayCsvSchema>;
type metaTraderTradeType = z.infer<typeof metaTraderArrayCsvSchema>;
type ibkrTradeType = z.infer<typeof ibkrArrayCsvSchema>;
interface Trade {
  Name: string;
  Time: string;
  Price: number;
  PnL: number;
  Size: number;
}

const ORDER_TYPE = "sell";
const DIFFERNCE_IN_TIMEZONE = 7;

export const transformCsvData = (data: unknown[], tradeSchema: string) => {
  if (tradeSchema === "topStep") {
    const tradeData = data as topStepTradeType;
    return transformTopStepData(tradeData);
  } else if (tradeSchema === "metaTrader") {
    const tradeData = data as metaTraderTradeType;
    return tradeData.map((tradeRow) => transformMetaTraderData(tradeRow));
  } else if (tradeSchema === "ibkr") {
    const tradeData = data as ibkrTradeType;
    return tradeData.map((tradeRow) => transformIbkrData(tradeRow));
  } else return null;
};

const transformTopStepData = (tradeData: topStepTradeType) => {
  const combinedEntryTrades: Record<string, Trade> = {};
  const combinedExitTrades: Record<string, Trade> = {};
  tradeData.forEach((trade) => {
    const key = `${trade.EnteredAt}-${trade.EntryPrice}`;
    const exitKey = `${trade.ExitedAt}-${trade.ExitPrice}`;

    if (!combinedEntryTrades[key]) {
      combinedEntryTrades[key] = {
        Time: trade.EnteredAt,
        Price: trade.EntryPrice,
        PnL: 0,
        Size: trade.Type === "Long" ? trade.Size : -trade.Size,
        Name: trade.ContractName,
      };
    } else {
      combinedEntryTrades[key]!.Size +=
        trade.Type === "Long" ? trade.Size : -trade.Size;
    }

    if (!combinedExitTrades[exitKey]) {
      combinedExitTrades[exitKey] = {
        Time: trade.ExitedAt,
        Price: trade.ExitPrice,
        PnL: trade.PnL,
        Size: trade.Type === "Long" ? -trade.Size : trade.Size,
        Name: trade.ContractName,
      };
    } else {
      combinedExitTrades[exitKey]!.Size +=
        trade.Type === "Long" ? -trade.Size : trade.Size;
      combinedExitTrades[exitKey]!.PnL += trade.PnL;
    }
  });

  const combinedArray = [
    ...Object.values(combinedEntryTrades),
    ...Object.values(combinedExitTrades),
  ];

  combinedArray.sort(
    (a, b) => new Date(a.Time).getTime() - new Date(b.Time).getTime()
  );
  const formattedTrades = combinedArray.map((trade) => {
    const { Name, Time, PnL, Price, Size } = trade;

    const date = moment(Time, "MM/DD/YYYY HH:mm:ss").subtract(0, "hours");
    const formattedDate = date.format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";

    return {
      Symbol: Name,
      TimeStamp: formattedDate,
      Price: Price,
      Profit: PnL,
      Volume: Size,
    };
  });

  return formattedTrades;
};

const transformMetaTraderData = (tradeRow: metaTraderTradeType[0]) => {
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

const transformIbkrData = (tradeRow: ibkrTradeType[0]) => {
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

export const processDailyTrades = (trades: dataBaseTradeArrayType) => {
  const sortedTrades = sortTradesByDayAndSymbol(trades);

  return sortedTrades.reduce<TradeDetailsData[]>(
    (dailyTrades, currentTrade) => {
      const { Symbol, Profit, TimeStamp } = currentTrade;
      const lastTrade = dailyTrades[dailyTrades.length - 1];

      if (
        !lastTrade ||
        lastTrade.Symbol !== Symbol ||
        !lastTrade.openTimeStamp?.startsWith(TimeStamp.substring(0, 10))
      ) {
        dailyTrades.push({
          Symbol,
          Profit,
          openTimeStamp: TimeStamp,
          closeTimeStamp: null,
        });
      } else {
        lastTrade.Profit += Profit;
        lastTrade.closeTimeStamp = TimeStamp;
      }

      return dailyTrades;
    },
    []
  );
};

export const formatUtcTimestamp = (timestamp: string | Date) => {
  let utcTimestamp: Date;

  if (typeof timestamp === "string") {
    utcTimestamp = new Date(timestamp);
    return moment.utc(utcTimestamp).format("MM/DD/YYYY h:mm:ss");
  } else if (timestamp instanceof Date) {
    utcTimestamp = timestamp;
    return moment.utc(utcTimestamp).format("YYYY-MM-DD HH:mm:ss");
  } else {
    throw new Error("Invalid timestamp type");
  }
};

const sortTradesByDayAndSymbol = (trades: dataBaseTradeArrayType) => {
  return trades.sort((a, b) => {
    const aDate = moment(a.TimeStamp);
    const bDate = moment(b.TimeStamp);

    if (aDate.month() !== bDate.month()) {
      return aDate.month() - bDate.month();
    }

    if (aDate.date() !== bDate.date()) {
      return aDate.date() - bDate.date();
    }

    return a.Symbol.localeCompare(b.Symbol);
  });
};

export const getDateRangeTimestamps = (startDate: string, endDate: string) => {
  const timeStampStart = moment(startDate, "MM/DD/YYYY")
    .startOf("day")
    .format();
  const timeStampEnd = moment(endDate, "MM/DD/YYYY").endOf("day").format();

  return { timeStampStart, timeStampEnd };
};
