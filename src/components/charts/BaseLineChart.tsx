import { useEffect, useRef } from "react";

import {
  formatTooltipValue,
  getChartColors,
} from "~/features/tradeStats/utils/chartUtils";

import { type Time, createChart } from "lightweight-charts";

import { CHART_STYLES } from "./constants";

interface Props {
  data: { time: Time; value: number }[];
  currentTheme: string | null;
  showTime?: boolean;
}

export const BaseLineChart = ({
  data,
  currentTheme,
  showTime = false,
}: Props) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const toolTipRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    const isDark = currentTheme === CHART_STYLES.THEME_FOREST;

    const chart = createChart(chartRef.current, {
      layout: {
        background: {
          color: isDark ? CHART_STYLES.DARK_MODE : CHART_STYLES.LIGHT_MODE,
        },
        textColor: isDark ? CHART_STYLES.WHITE : CHART_STYLES.DARK_MODE,
      },
      grid: { vertLines: { color: "#444" }, horzLines: { color: "#444" } },
      autoSize: true,
      crosshair: {
        mode: 0,
        horzLine: { labelBackgroundColor: CHART_STYLES.LIGHT_MODE },
      },
    });

    const areaSeries = chart.addAreaSeries();
    const colors = getChartColors(data);

    areaSeries.applyOptions({
      ...colors,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    areaSeries.setData(data);

    chart.subscribeCrosshairMove((param) => {
      if (toolTipRef.current) {
        if (param.time) {
          const point = param.seriesData.get(areaSeries) as { value: number };
          const { text, color } = formatTooltipValue(point?.value ?? 0);
          toolTipRef.current.innerText = text;
          toolTipRef.current.style.color = color;
        } else {
          toolTipRef.current.innerText = "";
        }
      }
    });

    chart.timeScale().fitContent();
    chart
      .timeScale()
      .applyOptions({ timeVisible: showTime, secondsVisible: false });

    return () => chart.remove();
  }, [data, currentTheme, showTime]);

  return (
    <div className="relative w-full h-full">
      <span
        ref={toolTipRef}
        className="top-3 left-4 z-20 absolute font-mono font-bold"
      />
      <div className="w-full h-full" ref={chartRef} />
    </div>
  );
};
