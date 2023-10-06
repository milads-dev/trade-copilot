import { z } from "zod";

const baseTradeSchema = z.object({
  Symbol: z.string(),
  Price: z.number(),
  Profit: z.number(),
  Volume: z.number(),
});

export const metaTraderCsvSchema = baseTradeSchema.extend({
  Time: z.string(),
  Type: z.string(),
});

export const dataBaseTradeSchema = baseTradeSchema.extend({
  TimeStamp: z.string(),
});

export const ibkrCsvSchema = z.object({
  Symbol: z.string(),
  DateTime: z.string(),
  TradePrice: z.number(),
  FifoPnlRealized: z.number(),
  Quantity: z.number(),
});

export const generalCsvSchema = z.union([metaTraderCsvSchema, ibkrCsvSchema]);

export const arrayCsvSchema = z.array(generalCsvSchema);

export const dataBaseTradeArraySchema = z.array(dataBaseTradeSchema);
