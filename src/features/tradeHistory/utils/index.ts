import moment from "moment";

import { generalCsvSchema, ibkrCsvSchema, metaTraderCsvSchema } from "../types";

const ORDER_TYPE = "sell";
const DIFFERNCE_IN_TIMEZONE = 7;

const validateCsvData = (data: unknown[]) =>
  data
    .map((tradeRow) => {
      const validatedTradeRow = generalCsvSchema.safeParse(tradeRow);
      if (validatedTradeRow.success) {
        return validatedTradeRow.data;
      } else {
        console.error("Validation Error for item:", validatedTradeRow.error);
        return null;
      }
    })
    .filter((item) => item !== null);

export const getValidCsvData = (data: unknown[]) => validateCsvData(data);

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

const isMetaTraderCsv = (
  inputArray: unknown[]
): inputArray is (typeof metaTraderCsvSchema)[] =>
  Array.isArray(inputArray) &&
  inputArray.every(
    (input) =>
      typeof input === "object" &&
      input !== null &&
      "Symbol" in input &&
      "Time" in input &&
      "Price" in input &&
      "Profit" in input &&
      "Volume" in input
  );

const isIbkrCsv = (
  inputArray: unknown[]
): inputArray is (typeof ibkrCsvSchema)[] =>
  Array.isArray(inputArray) &&
  inputArray.every(
    (input) =>
      typeof input === "object" &&
      input !== null &&
      "Symbol" in input &&
      "DateTime" in input &&
      "TradePrice" in input &&
      "FifoPnlRealized" in input &&
      "Quantity" in input
  );
