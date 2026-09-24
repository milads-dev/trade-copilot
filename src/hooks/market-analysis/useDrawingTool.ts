import { useEffect, useRef } from "react";
import { mergeStyles } from "react-select";

import { useChartDrawingsStore } from "~/hooks/market-analysis/useChartDrawingsStore";

import {
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type MouseEventParams,
} from "lightweight-charts";

import {
  type RectangleParams,
  RectanglePrimitive,
} from "../../components/charts/RecanglePrimitive";

export const useDrawingTool = (
  chart: IChartApi | null,
  series: ISeriesApi<"Candlestick"> | null,
  currentDate: string
) => {
  const {
    drawings,
    addRectangle,
    addLine,
    mode: drawingMode,
    setMode: setDrawingMode,
  } = useChartDrawingsStore();

  const activeRectRef = useRef<RectanglePrimitive | null>(null);
  const chartDrawingsMap = useRef<Map<string, RectanglePrimitive>>(new Map());
  const priceLineMapRef = useRef<Map<string, IPriceLine>>(new Map());

  // Rectangle drawing logic
  useEffect(() => {
    if (!chart || !series || drawingMode !== "DRAW_RECTANGLE") return;

    const onClick = (param: MouseEventParams) => {
      if (!param.point || !param.time) return;
      const price = series.coordinateToPrice(param.point.y);
      if (price === null) return;

      if (!activeRectRef.current) {
        const newRect = new RectanglePrimitive(
          {
            time1: param.time,
            price1: price,
            time2: param.time,
            price2: price,
          }
          // {
          //   fillColor: "red",
          // }
        );
        series.attachPrimitive(newRect);
        activeRectRef.current = newRect;
      } else {
        const finalParams = activeRectRef.current.getRect();
        series.detachPrimitive(activeRectRef.current);
        addRectangle(finalParams);
        activeRectRef.current = null;
        setDrawingMode("IDLE");
      }
    };

    const onMove = (param: MouseEventParams) => {
      if (!activeRectRef.current || !param.point || !param.time) return;
      const price = series.coordinateToPrice(param.point.y);
      if (price !== null) {
        activeRectRef.current.updateRect({
          time2: param.time,
          price2: price,
        });
      }
    };

    chart.subscribeClick(onClick);
    chart.subscribeCrosshairMove(onMove);

    return () => {
      chart.unsubscribeClick(onClick);
      chart.unsubscribeCrosshairMove(onMove);
      if (activeRectRef.current) {
        series.detachPrimitive(activeRectRef.current);
        activeRectRef.current = null;
      }
    };
  }, [chart, series, drawingMode, addRectangle, setDrawingMode]);

  // Price line drawing logic
  useEffect(() => {
    if (!chart || !series || drawingMode !== "DRAW_LINE") return;

    const onClick = (param: MouseEventParams) => {
      if (!param.point || !param.time) return;
      const price = series.coordinateToPrice(param.point.y);
      if (price === null) return;

      const dateString = new Date((param.time as number) * 1000)
        .toISOString()
        .split("T")[0];

      // Add price line to store
      const formattedPrice = Math.round(price / 0.25) * 0.25;

      addLine({
        date: dateString!,
        price: formattedPrice,
      });

      setDrawingMode("IDLE");
    };

    chart.subscribeClick(onClick);

    return () => {
      chart.unsubscribeClick(onClick);
    };
  }, [chart, series, drawingMode, addLine, setDrawingMode]);

  // Render drawings from store
  useEffect(() => {
    if (!series || !chart) return;

    const filteredDrawings = drawings.filter((drawing) => {
      if (drawing.type === "LINE") {
        const params = drawing.params as { price: number; date: string };
        return params.date === currentDate;
      } else if (drawing.type === "RECTANGLE") {
        const params = drawing.params as RectangleParams;
        const rectDate = new Date((params.time1 as number) * 1000)
          .toISOString()
          .split("T")[0];
        return rectDate === currentDate;
      }
      return false;
    });

    const drawingIdsInStore = new Set(filteredDrawings.map((d) => d.id));

    filteredDrawings.forEach((drawing) => {
      if (drawing.type === "RECTANGLE") {
        const existingDrawing = chartDrawingsMap.current.get(drawing.id);
        if (!existingDrawing) {
          const newDrawing = new RectanglePrimitive(
            drawing.params as RectangleParams,
            drawing.styles
          );
          series.attachPrimitive(newDrawing);
          chartDrawingsMap.current.set(drawing.id, newDrawing);
        } else {
          existingDrawing.updateRect(drawing.params as RectangleParams);
        }
      } else if (drawing.type === "LINE") {
        const params = drawing.params as { price: number; date: string };
        const existingLine = priceLineMapRef.current.get(drawing.id);
        if (!existingLine) {
          const newPriceLine = series.createPriceLine({
            price: params.price,
            color: "#2962FF",
            lineWidth: 2,
            lineStyle: 0,
            title: drawing.title,
          });
          priceLineMapRef.current.set(drawing.id, newPriceLine);
        } else {
          series.removePriceLine(existingLine);
          const updatedPriceLine = series.createPriceLine({
            price: params.price,
            color: "#2962FF",
            lineWidth: 2,
            lineStyle: 0,
            title: drawing.title,
          });
          priceLineMapRef.current.set(drawing.id, updatedPriceLine);
        }
      }
    });
    console.log("🚀 ~ useDrawingTool ~ drawings:", drawings);

    // Remove deleted rectangles
    chartDrawingsMap.current.forEach((primitive, id) => {
      if (!drawingIdsInStore.has(id)) {
        series.detachPrimitive(primitive);
        chartDrawingsMap.current.delete(id);
      }
    });

    // Remove deleted price lines
    priceLineMapRef.current.forEach((priceLine, id) => {
      if (!drawingIdsInStore.has(id)) {
        series.removePriceLine(priceLine);
        priceLineMapRef.current.delete(id);
      }
    });

    chart.applyOptions({});
  }, [drawings, series, chart, currentDate]);
};
