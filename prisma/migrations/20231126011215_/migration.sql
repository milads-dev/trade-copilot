-- CreateTable
CREATE TABLE "TradeTagRelation" (
    "id" SERIAL NOT NULL,
    "tagId" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TradeTagRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TradeTagRelation_tagId_symbol_date_userId_key" ON "TradeTagRelation"("tagId", "symbol", "date", "userId");

-- AddForeignKey
ALTER TABLE "TradeTagRelation" ADD CONSTRAINT "TradeTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeTagRelation" ADD CONSTRAINT "TradeTagRelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
