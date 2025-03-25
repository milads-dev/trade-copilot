export interface LineType {
  id?: number;
  title: string;
  price: string;
  color: string;
  style: string;
  size: string;
}

export interface TradeDetails {
  Symbol: string;
  TimeStamp: string;
  Price: number;
  Profit: number;
  Volume: number;
}
