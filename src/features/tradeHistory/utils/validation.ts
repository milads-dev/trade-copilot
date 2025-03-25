import {
  type ibkrCsvSchema,
  type metaTraderCsvSchema,
  topStepXTradeSchema,
  unionCsvSchema,
} from "../types";

type ValidSchema = typeof topStepXTradeSchema | typeof unionCsvSchema;

const schemaMap: Record<string, ValidSchema> = {
  topStep: topStepXTradeSchema,
  metaTrader: unionCsvSchema,
  ibkr: unionCsvSchema,
};

const validateCsvData = (data: unknown[], schemaKey: string) => {
  const selectedSchema = schemaMap[schemaKey];

  if (!selectedSchema) {
    console.error(`Schema not found for key: ${schemaKey}`);
    return null;
  }

  return data
    .map((tradeRow) => {
      const validatedTradeRow = selectedSchema.safeParse(tradeRow);
      if (validatedTradeRow.success) {
        return validatedTradeRow.data;
      } else {
        return null;
      }
    })
    .filter((item) => item !== null);
};

export const getValidCsvData = (data: unknown[], schemaKey: string) =>
  validateCsvData(data, schemaKey);

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
