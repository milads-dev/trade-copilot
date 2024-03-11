-- CreateTable
CREATE TABLE "PriceLine" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "color" TEXT NOT NULL,
    "style" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "tradeDetailsId" INTEGER NOT NULL,

    CONSTRAINT "PriceLine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PriceLine" ADD CONSTRAINT "PriceLine_tradeDetailsId_fkey" FOREIGN KEY ("tradeDetailsId") REFERENCES "TradeDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
