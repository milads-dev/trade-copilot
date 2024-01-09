import type { RouterOutputs } from "~/utils/api";

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

export interface OptionType {
  value: string;
  label: string;
  type?: string;
  id: number;
}

export type DailyTrades =
  RouterOutputs["trades"]["getTradesByDate"]["dailyTrades"];

export interface Tag {
  id: number;
  name: string;
  type: string;
}

export interface TagDetail {
  value: string;
  label: string;
  id: number;
  type?: string;
}

export interface TradeTags {
  setup: TagDetail[];
  mistake: TagDetail[];
  custom: TagDetail[];
}

export type DetailsCardTag = {
  type: "Setup" | "Mistake" | "Custom";
  className: string;
  value: TagDetail[] | undefined; // Replace with the actual type you expect for value
  options: TagDetail[] | undefined; // Replace with the actual type you expect for options
};
