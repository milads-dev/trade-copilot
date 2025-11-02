import {
  topStepArrayCsvSchema,
  unionArrayCsvSchema,
} from "~/features/tradeHistory/types";
import {
  getValidCsvData,
  transformCsvData,
} from "~/features/tradeHistory/utils";

import { type z } from "zod";

interface CsvObject {
  data: unknown[];
  error: unknown;
  meta: unknown;
}

interface TradeDetails {
  Symbol: string;
  TimeStamp: string;
  Price: number;
  Profit: number;
  Volume: number;
}

const schemaMap: Record<string, z.Schema> = {
  topStep: topStepArrayCsvSchema,
  metaTrader: unionArrayCsvSchema,
  ibkr: unionArrayCsvSchema,
};

/**
 * Handles CSV file parsing, validation, and transformation.
 * Extracted for reusability and easier testing.
 */
export const handleOnDrop = (
  input: CsvObject,
  tradeSchema: string,
  setTradeData: React.Dispatch<React.SetStateAction<TradeDetails[]>>
): void => {
  const { data } = input;
  const selectedSchema = schemaMap[tradeSchema];

  if (!selectedSchema) return;

  const result = selectedSchema.safeParse(getValidCsvData(data, tradeSchema));

  if (result.success) {
    const transformTradeData = transformCsvData(
      result.data as unknown[],
      tradeSchema
    );

    if (transformTradeData !== null && transformTradeData.length > 0) {
      setTradeData(transformTradeData);
    } else {
      alert("Wrong Trade Format");
    }
  }
};
