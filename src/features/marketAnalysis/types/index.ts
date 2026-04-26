export type Mode =
  | "IDLE"
  | "AWAITING_ENTRY"
  | "AWAITING_TRIM"
  | "AWAITING_CLOSE";

export interface TradeLeg {
  type: "LONG" | "SHORT";
  qty: number;
  price: number;
  time: number;
  label: string;
  pnl: number;
}
