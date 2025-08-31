import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";

import {
  type CandlestickData,
  type DailyTrades,
  generateMarkers,
  openPriceLineModal,
} from "~/features/tradeDetails";
import { useAppStore } from "~/hooks/useAppStore";
import { useThemeObserver } from "~/hooks/useThemeObserver";
import { api } from "~/utils/api";

import {
  type BarData,
  type LineWidth,
  type Time,
  createChart,
} from "lightweight-charts";

import { TimeFrameModal } from "../modals";
import { CHART_STYLES } from "./constants";
import { createChartToolTip, renderChartToolTip } from "./helper";

interface Props {
  chartMarkers: DailyTrades | null | undefined | "hidden";
}
export const CandleStickChart = ({ chartMarkers }: Props) => {
  const router = useRouter();
  const symbol = router.query.symbol as string;
  const date = router.query.date as string;
  const hiddenPriceLineIds = useAppStore((state) => state.hiddenPriceLineIds);
  const [timeFrame, setTimeFrame] = useState(1);

  const currentTheme = useThemeObserver();

  const { data: details, isLoading } = api.trades.getChartData.useQuery(
    { symbol, date, timeFrame },
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

  const { data: priceLineData } = api.tradeDetails.getPriceLines.useQuery(
    { symbol, date },
    {
      refetchOnWindowFocus: false,
    }
  );
  const { priceLines = [] } = priceLineData ?? {};

  const { data: candleData = [] } = details ?? {};
  const { dailyTrades } = data ?? {};
  const chartRef = useRef<HTMLDivElement>(null);

  console.log("details", details);

  useEffect(() => {
    const chart = createChart(chartRef.current!, {
      layout: {
        background: {
          color:
            currentTheme === CHART_STYLES.THEME_FOREST
              ? CHART_STYLES.CHART_DARK_MODE
              : CHART_STYLES.LIGHT_MODE,
        },
        textColor:
          currentTheme === CHART_STYLES.THEME_FOREST
            ? CHART_STYLES.WHITE
            : CHART_STYLES.DARK_MODE,
      },
      grid: {
        vertLines: { color: "#444" },
        horzLines: { color: "#444" },
      },
      autoSize: true,
      width: 0,
      height: 690,

      crosshair: {
        mode: 0,
        horzLine: {
          labelBackgroundColor: CHART_STYLES.WHITE,
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
    if (priceLines.length > 0)
      priceLines
        .filter((line) => !hiddenPriceLineIds.includes(line.id))
        .map((line) =>
          candleSeries.createPriceLine({
            title: line.title,
            price: parseFloat(line.price),
            color: line.color,
            lineStyle: parseInt(line.style),
            lineWidth: parseInt(line.size) as LineWidth,
          })
        );
    if (dailyTrades) {
      if (chartMarkers && chartMarkers.length > 0) {
        if (typeof chartMarkers !== "string") {
          candleSeries.setMarkers(
            generateMarkers(
              chartMarkers.sort((a, b) => a.Marker - b.Marker),
              timeFrame
            )
          );
        }
      } else {
        candleSeries.setMarkers(generateMarkers(dailyTrades, timeFrame));
      }
    }
    const container = document.getElementById("candleChart");

    const toolTip = createChartToolTip(container);

    chart.subscribeCrosshairMove((param) => {
      const data = param.seriesData.get(candleSeries) as BarData<Time>;

      const selectedTrades =
        Array.isArray(chartMarkers) && chartMarkers.length > 0
          ? chartMarkers
          : dailyTrades;

      if (
        param.point === undefined ||
        !param.time ||
        !selectedTrades?.some((trade) => trade.Marker === data?.time) ||
        timeFrame !== 1
      ) {
        toolTip.style.display = "none";
      } else {
        const tradeWithMarker = dailyTrades?.find(
          (trade) => trade.Marker === data?.time
        );

        const candlePrice = param.seriesData.get(candleSeries) as BarData<Time>;
        if (candlePrice === undefined || tradeWithMarker?.Profit === 0) {
          toolTip.style.display = "none";
        } else {
          toolTip.style.display = "block";
          renderChartToolTip(
            toolTip,
            tradeWithMarker!.Profit,
            candleSeries,
            candlePrice,
            param.point.x
          );
        }
      }
    });

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [
    candleData,
    dailyTrades,
    priceLines,
    hiddenPriceLineIds,
    chartMarkers,
    timeFrame,
  ]);

  return (
    <section className="relative">
      <div
        id="candleChart"
        className={`cursor relative  ${isLoading && "opacity-20"}`}
        ref={chartRef}
        style={{ backgroundColor: "#624b4b" }}
        onKeyDown={() => openPriceLineModal()}
        tabIndex={1}
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
      <TimeFrameModal timeFrame={timeFrame} setTimeFrame={setTimeFrame} />
    </section>
  );
};
