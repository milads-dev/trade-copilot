import { useEffect, useRef } from "react";

import { useChartDrawingsStore } from "~/hooks/useChartDrawingsStore";

import {
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
} from "lightweight-charts";

import { RectanglePrimitive } from "../../components/charts/RecanglePrimitive";

export const useRectangleDrawingTool = (
  chart: IChartApi | null,
  series: ISeriesApi<"Candlestick"> | null
) => {
  const {
    drawings,
    addRectangle,
    mode: drawingMode,
    setMode: setDrawingMode,
  } = useChartDrawingsStore();

  const activeRectRef = useRef<RectanglePrimitive | null>(null);
  const chartDrawingsMap = useRef<Map<string, RectanglePrimitive>>(new Map());

  useEffect(() => {
    if (!chart || !series || drawingMode !== "DRAW_RECTANGLE") return;

    const onClick = (param: MouseEventParams) => {
      if (!param.point || !param.time) return;
      const price = series.coordinateToPrice(param.point.y);
      if (price === null) return;

      if (!activeRectRef.current) {
        const newRect = new RectanglePrimitive({
          time1: param.time,
          price1: price,
          time2: param.time,
          price2: price,
        });
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

  useEffect(() => {
    if (!series) return;

    const drawingIdsInStore = new Set(drawings.map((d) => d.id));

    drawings.forEach((drawing) => {
      const existingDrawing = chartDrawingsMap.current.get(drawing.id);
      if (!existingDrawing) {
        const newDrawing = new RectanglePrimitive(drawing.params);
        series.attachPrimitive(newDrawing);
        chartDrawingsMap.current.set(drawing.id, newDrawing);
      } else {
        existingDrawing.updateRect(drawing.params);
      }
    });

    chartDrawingsMap.current.forEach((primitive, id) => {
      if (!drawingIdsInStore.has(id)) {
        series.detachPrimitive(primitive);
        chartDrawingsMap.current.delete(id);
        chart?.applyOptions({});
      }
    });
  }, [drawings, series, chart]);
};
