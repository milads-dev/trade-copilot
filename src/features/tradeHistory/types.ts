import { z } from "zod";

export const DateRangeSchema = z.tuple([
  z.date().or(z.null()),
  z.date().or(z.null()),
]);
export type DateRangeType = z.infer<typeof DateRangeSchema>;

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

export type dataBaseTradeArrayType = z.infer<typeof dataBaseTradeArraySchema>;
