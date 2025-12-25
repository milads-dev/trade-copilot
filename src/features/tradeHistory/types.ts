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

export const topStepXTradeSchema = z.object({
  ContractName: z.string(),
  EnteredAt: z.string(),
  ExitedAt: z.string(),
  TradeDay: z.string().optional(),
  Type: z.enum(["Long", "Short"]),
  Id: z.number().optional(),
  EntryPrice: z.number(),
  ExitPrice: z.number(),
  Fees: z.number().optional(),
  PnL: z.number(),
  Size: z.number(),
});

export const metaTraderCsvSchemaDemo = z.object({
  Symbol: z.string(),
  Price: z.number(),
  Profit: z.number(),
  Volume: z.number(),
  Time: z.string(),
  Type: z.string(),
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

export const unionCsvSchema = z.union([metaTraderCsvSchema, ibkrCsvSchema]);

export const unionArrayCsvSchema = z.array(unionCsvSchema);

export const topStepArrayCsvSchema = z.array(topStepXTradeSchema);

export const metaTraderArrayCsvSchema = z.array(metaTraderCsvSchema);

export const ibkrArrayCsvSchema = z.array(ibkrCsvSchema);

export const dataBaseTradeArraySchema = z.array(dataBaseTradeSchema);

export type dataBaseTradeArrayType = z.infer<typeof dataBaseTradeArraySchema>;

export type TradeDetailsData = {
  Symbol: string;
  Profit: number;
  openTimeStamp: string;
  closeTimeStamp: string | null;
};
