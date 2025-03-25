import { useEffect, useRef } from "react";

import { useRouter } from "next/router";

import { calculateAreaChartLine } from "~/features/tradeStats";
import { api } from "~/utils/api";

import { createChart } from "lightweight-charts";

export const AreaLineChart = () => {
  const router = useRouter();
  const startDate = router.query.from as string;
  const endDate = router.query.to as string;

  const chartRef = useRef<HTMLDivElement>(null);
  const toolTipRef = useRef<HTMLSpanElement | null>(null);

  const { data, isLoading } = api.trades.getStats.useQuery(
    { startDate, endDate },
    {
      refetchOnWindowFocus: false,
    }
  );

  const areaData = data?.areaData;

  useEffect(() => {
    const chart = createChart(chartRef.current!, {
      layout: {
        background: { color: "##030202" },
        textColor: "#FFF",
      },
      grid: {
        vertLines: { color: "#444" },
        horzLines: { color: "#444" },
      },
      autoSize: true,

      width: 0,
      height: 0,

      crosshair: {
        mode: 0,
        horzLine: {
          labelBackgroundColor: "#FFF",
        },
      },
    });

    const areaSeries = chart.addAreaSeries();
    let topColor;
    let bottomColor;
    let lineColor;

    if (areaData && areaData.length > 0) {
      const areaSeriesData = calculateAreaChartLine(areaData);
      areaSeries.setData(areaSeriesData);
      topColor =
        areaSeriesData[areaSeriesData.length - 1]!.value > 0
          ? "rgba( 46, 220, 135, 0.4)"
          : "rgba( 220, 0, 0, 0.7)";
      bottomColor =
        areaSeriesData[areaSeriesData.length - 1]!.value > 0
          ? "rgba( 40, 221, 100, 0)"
          : "rgba( 220, 46, 46, 0.1)";
      lineColor =
        areaSeriesData[areaSeriesData.length - 1]!.value > 0
          ? "#33D778"
          : "#e43030";
    }

    areaSeries.applyOptions({
      lastValueVisible: false,
      priceLineVisible: false,
      topColor: topColor,
      bottomColor: bottomColor,
      lineColor: lineColor,
    });

    chart.subscribeCrosshairMove((param) => {
      if (param.time) {
        const data = param.seriesData.get(areaSeries);
        if (data) {
          const { value } = data as { value: number };
          if (toolTipRef.current) {
            if (value > 0) {
              toolTipRef.current.innerText = `$${value.toFixed(2)}`;
              toolTipRef.current.style.color = "green";
            } else if (value < 0) {
              toolTipRef.current.innerText = `$(${Math.abs(value).toFixed(2)})`;
              toolTipRef.current.style.color = "red";
            } else {
              toolTipRef.current.innerText = `$${value}`;
              toolTipRef.current.style.color = "white";
            }
          }
        }
      } else {
        if (toolTipRef.current) {
          toolTipRef.current.innerText = "";
        }
      }
    });

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [areaData]);

  return (
    <section className="relative">
      <div
        className={`z-10 ml-20 mt-16 h-96 w-[24rem] rounded-lg min-[1920px]:w-[36rem] ${
          isLoading && "opacity-0"
        }`}
      >
        <div className="absolute left-[4.5rem] top-0 z-[-1] h-full w-[80%] rounded-3xl bg-black min-[1920px]:w-[85%]"></div>

        <div
          className="ml-10 h-full w-[85%] min-[1920px]:w-[90%]"
          ref={chartRef}
        ></div>
        <span ref={toolTipRef} className="absolute left-28 top-5 z-20"></span>
      </div>
      {isLoading ? (
        <div className="absolute left-20 top-0 h-96 w-[24rem] rounded-3xl bg-base-200 min-[1920px]:w-[36rem]">
          <span className="loading loading-infinity loading-lg absolute left-[50%] top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform text-success"></span>
        </div>
      ) : null}
    </section>
  );
};
