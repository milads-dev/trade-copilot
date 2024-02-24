-- AlterTable
ALTER TABLE "TradeTagRelation" ADD COLUMN     "tradeId" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "TradeTagRelation" ADD CONSTRAINT "TradeTagRelation_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "TradeDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
