import { useEffect, useRef } from "react";

import {
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  createChart,
} from "lightweight-charts";

import { CHART_STYLES } from "../components/charts/constants";

interface ChartData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const useChartInit = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  candleData: ChartData[],
  currentTheme: string | null
) => {
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
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
      height: 690,
      crosshair: {
        mode: 0,
        horzLine: { labelBackgroundColor: CHART_STYLES.WHITE },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#485158",
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return (
            date.getHours().toString().padStart(2, "0") +
            ":" +
            date.getMinutes().toString().padStart(2, "0")
          );
        },
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: {
        minMove: 0.25,
        precision: 2,
      },
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only runs once on mount

  const hasInitialFit = useRef(false);
  useEffect(() => {
    if (!seriesRef.current || candleData.length === 0) return;
    if (seriesRef.current && candleData.length > 0) {
      seriesRef.current.setData(candleData);
      if (!hasInitialFit.current) {
        requestAnimationFrame(() => {
          chartRef.current?.timeScale().fitContent();
          chartRef.current?.timeScale().scrollToPosition(-10, false);
          chartRef.current?.timeScale().setVisibleLogicalRange({
            from: -10,
            to: candleData.length + 10,
          });
          hasInitialFit.current = true;
        });
      }
    }
  }, [candleData]);

  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
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
      localization: {
        timeFormatter: (timestamp: number) => {
          const date = new Date(timestamp * 1000);
          return date.toLocaleTimeString();
        },
      },
    });
  }, [currentTheme]);

  return {
    chart: chartRef.current,
    series: seriesRef.current,
  };
};
