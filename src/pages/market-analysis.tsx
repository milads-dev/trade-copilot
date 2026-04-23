import React, { useEffect } from "react";

import Head from "next/head";

import { Drawer } from "~/components/Drawer";
import { CandleStickChart } from "~/components/charts/CandleStickChart";
import { MarketTradeController } from "~/features/market-analysis/components/MarketTradeController";
import { TradeLedger } from "~/features/market-analysis/components/TradeLedger";
import { useAnalyzerStore } from "~/hooks/useAnalyzerStore";

const MarketAnalyzer = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        useAnalyzerStore.getState().cancelArm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const tradeLegs = useAnalyzerStore((state) => state.legs);

  const runningQty = useAnalyzerStore((state) => state.runningQty);

  return (
    <>
      <Head>
        <title>Market Analysis</title>
        <meta name="description" content="The Market Analysis Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Drawer>
        <div className="flex flex-col bg-base-100 w-full h-[100%]">
          <div className="gap-1 grid grid-cols-[1fr_2fr_1fr] w-full h-full">
            <div className=""></div>
            <div className="my-3">
              <CandleStickChart chartMarkers={"hidden"} />
            </div>
            <div className="">
              <div className="flex flex-col gap-4 p-3 h-full overflow-y-auto">
                <MarketTradeController />
                <TradeLedger legs={tradeLegs} />
                <button
                  className="w-full btn btn-primary"
                  disabled={runningQty !== 0 || tradeLegs.length === 0}
                >
                  Save Trade {tradeLegs.length}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default MarketAnalyzer;
