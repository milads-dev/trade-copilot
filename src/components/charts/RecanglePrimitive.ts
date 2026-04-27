import {
  type CanvasRenderingTarget2D,
  type IChartApi,
  type ISeriesApi,
  type ISeriesPrimitive,
  type SeriesPrimitivePaneView,
  type Time,
} from "lightweight-charts";

export type RectangleParams = {
  time1: Time;
  time2: Time;
  price1: number;
  price2: number;
};

export class RectanglePrimitive implements ISeriesPrimitive<Time> {
  private _chart: IChartApi | null = null;
  private _series: ISeriesApi<"Candlestick"> | null = null;
  private _requestUpdate?: () => void;

  private _rect: RectangleParams;
  private _fillColor: string;
  private _strokeColor: string;

  constructor(
    rect: RectangleParams,
    fillColor = "rgba(0, 150, 255, 0.1)",
    strokeColor = "rgba(2, 158, 255, 0.9)"
  ) {
    this._rect = rect;
    this._fillColor = fillColor;
    this._strokeColor = strokeColor;
  }

  public attached({
    chart,
    series,
    requestUpdate,
  }: {
    chart: IChartApi;
    series: ISeriesApi<"Candlestick">;
    requestUpdate: () => void;
  }): void {
    this._chart = chart;
    this._series = series;
    this._requestUpdate = requestUpdate;
  }

  public detached(): void {
    this._chart = null;
    this._series = null;
    this._requestUpdate = undefined;
  }

  public getRect(): RectangleParams {
    return this._rect;
  }

  public updateRect(partial: Partial<RectangleParams>): void {
    this._rect = { ...this._rect, ...partial };
    this._requestUpdate?.();
  }

  public paneViews(): readonly SeriesPrimitivePaneView[] {
    return [
      {
        renderer: () => ({
          draw: (target: CanvasRenderingTarget2D) => {
            if (!this._chart || !this._series) return;
            if (!this._rect.time1 || !this._rect.time2) return;
            target.useBitmapCoordinateSpace(
              ({
                context: ctx,
                horizontalPixelRatio,
                verticalPixelRatio,
                mediaSize,
              }) => {
                const timeScale = this._chart!.timeScale();
                const series = this._series!;

                const x1 = timeScale.timeToCoordinate(this._rect.time1);
                const x2 = timeScale.timeToCoordinate(this._rect.time2);
                const y1 = series.priceToCoordinate(this._rect.price1);
                const y2 = series.priceToCoordinate(this._rect.price2);

                if (x1 === null || x2 === null || y1 === null || y2 === null)
                  return;

                const left = Math.min(x1, x2) * horizontalPixelRatio;
                const top = Math.min(y1, y2) * verticalPixelRatio;
                const width = Math.abs(x2 - x1) * horizontalPixelRatio;
                const height = Math.abs(y2 - y1) * verticalPixelRatio;

                ctx.fillStyle = this._fillColor;
                ctx.fillRect(left, top, width, height);

                ctx.strokeStyle = this._strokeColor;
                ctx.lineWidth = Math.max(1, Math.floor(horizontalPixelRatio));
                ctx.strokeRect(left, top, width, height);

                const middlePrice = (this._rect.price1 + this._rect.price2) / 2;
                const middleY = series.priceToCoordinate(middlePrice);

                if (middleY !== null) {
                  const midYScaled = middleY * verticalPixelRatio;
                  ctx.beginPath();

                  ctx.setLineDash([
                    6 * horizontalPixelRatio,
                    4 * horizontalPixelRatio,
                  ]);
                  ctx.moveTo(left, midYScaled);
                  ctx.lineTo(left + width, midYScaled);
                  ctx.strokeStyle = "#FFF";

                  ctx.stroke();
                  ctx.setLineDash([]);
                }
              }
            );
          },
        }),
      },
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public update(): void {}
  public hitTest(): null {
    return null;
  }
}
