import { useEffect } from "react";

import type {
  IChartApi,
  ISeriesApi,
  MouseEventParams,
} from "lightweight-charts";

import { useAnalyzerStore } from "./useAnalyzerStore";

export const useMarketOrderLogic = (
  chart: IChartApi | null,
  series: ISeriesApi<"Candlestick"> | null
) => {
  const { completeLeg, mode } = useAnalyzerStore();

  useEffect(() => {
    if (!chart || !series || mode === "IDLE") return;

    const onClick = (param: MouseEventParams) => {
      if (!param.point || !param.time) return;

      const price = series.coordinateToPrice(param.point.y);
      if (price && param.time) {
        //TODO Magic number will be changed in future update...
        const formattedPrice = Math.round(price / 0.25) * 0.25;
        completeLeg(formattedPrice, param.time as number);
      }
    };

    chart.subscribeClick(onClick);

    return () => {
      chart.unsubscribeClick(onClick);
    };
  }, [chart, series, mode, completeLeg]);
};
