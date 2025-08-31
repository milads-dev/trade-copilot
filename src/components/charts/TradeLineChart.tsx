"use client";

import React, { useEffect, useRef } from "react";

import { ColorType, type Time, createChart } from "lightweight-charts";

type Props = {
  data: { time: Time; value: number }[];
};

export const TradeLineChart = ({ data }: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#aaa",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      timeScale: {
        visible: false,
      },

      leftPriceScale: {
        visible: false,
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      handleScroll: false,
      handleScale: false,
    });

    const lineSeries = chart.addLineSeries({
      color: "#4ade80", // Tailwind green-400
      lineWidth: 2,
    });

    lineSeries.setData(data);

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className="pointer-events-none absolute inset-0 z-10"
    />
  );
};
