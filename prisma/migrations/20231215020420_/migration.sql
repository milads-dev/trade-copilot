/*
  Warnings:

  - A unique constraint covering the columns `[Symbol,TimeStamp,userId]` on the table `TradeHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TradeHistory_Symbol_TimeStamp_userId_Volume_Price_Profit_key";

-- AlterTable
ALTER TABLE "TradeHistory" ADD COLUMN     "tradeDetailsId" INTEGER;

-- CreateTable
CREATE TABLE "TradeDetails" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "rating" INTEGER,
    "notes" TEXT,

    CONSTRAINT "TradeDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TradeHistory_Symbol_TimeStamp_userId_key" ON "TradeHistory"("Symbol", "TimeStamp", "userId");

-- AddForeignKey
ALTER TABLE "TradeHistory" ADD CONSTRAINT "TradeHistory_tradeDetailsId_fkey" FOREIGN KEY ("tradeDetailsId") REFERENCES "TradeDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;
