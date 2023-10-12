import {
  generalCsvSchema,
  type ibkrCsvSchema,
  type metaTraderCsvSchema,
} from "../types";

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

export const isMetaTraderCsv = (
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

export const isIbkrCsv = (
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
