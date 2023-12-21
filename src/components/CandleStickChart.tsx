import { useEffect, useRef } from "react";

import { useRouter } from "next/router";

import { type CandlestickData, generateMarkers } from "~/features/tradeDetails";
import { api } from "~/utils/api";

import { createChart } from "lightweight-charts";

export const CandleStickChart = () => {
  const router = useRouter();
  const symbol = router.query.symbol as string;
  const date = router.query.date as string;

  const { data: details, isLoading } = api.trades.getTradeDetails.useQuery(
    { symbol, date },
    {
      refetchOnWindowFocus: false,
      staleTime: 20 * (60 * 1000),
      cacheTime: 25 * (60 * 1000),
    }
  );
  const { data } = api.trades.getTradesByDate.useQuery(
    { symbol: symbol, date: date },
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: candleData = [] } = details ?? {};
  const { dailyTrades } = data ?? {};
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chart = createChart(chartRef.current!, {
      layout: {
        background: { color: "#161B26" },
        textColor: "#FFF",
      },
      grid: {
        vertLines: { color: "#444" },
        horzLines: { color: "#444" },
      },

      width: 1000,
      height: 715,

      crosshair: {
        mode: 0,
        horzLine: {
          labelBackgroundColor: "#FFF",
        },
      },

      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#485158",
      },
    });

    const candleSeries = chart.addCandlestickSeries();
    candleSeries.applyOptions({
      lastValueVisible: false,
      priceLineVisible: false,
    });

    if (candleData && candleData.length > 0) {
      const candleSeriesData: CandlestickData[] = candleData;
      candleSeries.setData(candleSeriesData);
    }

    if (dailyTrades) candleSeries.setMarkers(generateMarkers(dailyTrades));

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [candleData, dailyTrades]);

  return (
    <section className="relative">
      <div
        className={`cursor relative  ${isLoading && "opacity-20"}`}
        ref={chartRef}
        style={{ backgroundColor: "#624b4b" }}
      ></div>
      {isLoading ? (
        <span className="loading loading-infinity loading-lg absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform text-success"></span>
      ) : null}
      {!dailyTrades ||
        (dailyTrades.length === 0 && (
          <div>
            <span className="loading loading-dots loading-lg absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform text-success"></span>
            <span className=" absolute left-1/2 top-1/2 z-10 mt-7 -translate-x-1/2 -translate-y-1/2 transform text-success">
              No Data Available
            </span>
          </div>
        ))}
    </section>
  );
};
