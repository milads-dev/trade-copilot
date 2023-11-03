/*
  Warnings:

  - A unique constraint covering the columns `[Symbol,TimeStamp,userId,Volume,Price,Profit]` on the table `TradeHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TradeHistory_Symbol_TimeStamp_userId_Volume_Price_Profit_key" ON "TradeHistory"("Symbol", "TimeStamp", "userId", "Volume", "Price", "Profit");
