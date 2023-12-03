import { type Time } from "lightweight-charts";
import { z } from "zod";

export const candleStickSchema = z.object({
  values: z.array(
    z.object({
      datetime: z.string(),
      open: z.string(),
      high: z.string(),
      low: z.string(),
      close: z.string(),
      volume: z.string(),
    })
  ),
});

export interface CandlestickData {
  time: Time;
  open: number | undefined;
  high: number | undefined;
  low: number | undefined;
  close: number | undefined;
  volume: number | undefined;
}
