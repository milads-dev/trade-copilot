import { type Time } from "lightweight-charts";
import { z } from "zod";

export const candleStickSchema = z.object({
  c: z.array(z.number()),
  h: z.array(z.number()),
  l: z.array(z.number()),
  o: z.array(z.number()),
  s: z.string(),
  t: z.array(z.number()),
  v: z.array(z.number()),
});

export interface CandlestickData {
  time: Time;
  open: number | undefined;
  high: number | undefined;
  low: number | undefined;
  close: number | undefined;
  volume: number | undefined;
}
