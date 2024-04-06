import { type BarData, type ISeriesApi } from "lightweight-charts";

export const createChartToolTip = (chartContainer: HTMLElement | null) => {
  const toolTip = document.createElement("div");

  toolTip.style.width = "fit-content";
  toolTip.style.minWidth = "75px";
  toolTip.style.height = "80px";
  toolTip.style.position = "absolute";
  toolTip.style.display = "none";
  toolTip.style.padding = "8px";
  toolTip.style.boxSizing = "border-box";
  toolTip.style.fontSize = "12px";
  toolTip.style.textAlign = "left";
  toolTip.style.zIndex = "1000";
  toolTip.style.top = "12px";
  toolTip.style.left = "12px";
  toolTip.style.background = "#030202";
  toolTip.style.color = "white";
  toolTip.style.borderRadius = "10px";

  chartContainer?.appendChild(toolTip);

  return toolTip;
};

export const renderChartToolTip = (
  toolTip: HTMLDivElement,
  profit: number,
  candleSeries: ISeriesApi<"Candlestick"> | null,
  candlePrice: BarData,
  currentPointX: number
) => {
  const GREEN_MARKER = "#4bAF59";
  const RED_MARKER = "#ff0419";

  toolTip.innerHTML = `
  <div style="display:flex; flex-direction:column; align-items:center;">
    <div>${profit > 0 ? "Profit" : "Loss"}</div>
      <div style="display: flex; align-items: center; margin-top: 4px;">
      <div style="font-size: 24px; margin-left:8px; margin-right:4px; color: ${
        profit > 0 ? "green" : "red"
      };">${profit}</div>
      <svg
      className="h-6 w-6"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
    
      <path     
        stroke="${profit > 0 ? GREEN_MARKER : RED_MARKER}"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        
        d="${
          profit > 0
            ? "m10.051 8.102-3.778.322-1.994 1.994a.94.94 0 0 0 .533 1.6l2.698.316m8.39 1.617-.322 3.78-1.994 1.994a.94.94 0 0 1-1.595-.533l-.4-2.652m8.166-11.174a1.366 1.366 0 0 0-1.12-1.12c-1.616-.279-4.906-.623-6.38.853-1.671 1.672-5.211 8.015-6.31 10.023a.932.932 0 0 0 .162 1.111l.828.835.833.832a.932.932 0 0 0 1.111.163c2.008-1.102 8.35-4.642 10.021-6.312 1.475-1.478 1.133-4.77.855-6.385Zm-2.961 3.722a1.88 1.88 0 1 1-3.76 0 1.88 1.88 0 0 1 3.76 0Z"
            : "M21.972 11.517a.527.527 0 0 0-1.034-.105 1.377 1.377 0 0 1-1.324 1.01 1.467 1.467 0 0 1-1.4-1.009.526.526 0 0 0-1.015 0 1.467 1.467 0 0 1-2.737.143l-.049-.204.021-.146V9.369h2.304a2.632 2.632 0 0 0 2.631-2.632 2.678 2.678 0 0 0-2.654-2.632l-.526.022-.13-.369A2.632 2.632 0 0 0 13.579 2c-.461 0-.915.124-1.313.358L12 2.513l-.266-.155A2.603 2.603 0 0 0 10.422 2a2.632 2.632 0 0 0-2.483 1.759l-.13.37-.518-.024a2.681 2.681 0 0 0-2.66 2.632A2.632 2.632 0 0 0 7.264 9.37H9.61v1.887l-.007.09-.028.08a1.328 1.328 0 0 1-1.301.996 1.632 1.632 0 0 1-1.502-1.024.526.526 0 0 0-1.01.013 1.474 1.474 0 0 1-1.404 1.01 1.381 1.381 0 0 1-1.325-1.01.547.547 0 0 0-.569-.382h-.008a.526.526 0 0 0-.456.526v.446a10.012 10.012 0 0 0 10 10 9.904 9.904 0 0 0 7.067-2.94A10.019 10.019 0 0 0 22 11.966l-.028-.449ZM8.316 15.685a1.053 1.053 0 1 1 2.105 0 1.053 1.053 0 0 1-2.105 0Zm1.58 3.684a2.105 2.105 0 0 1 4.21 0h-4.21Zm4.736-2.631a1.052 1.052 0 1 1 0-2.105 1.052 1.052 0 0 1 0 2.105Z"
        }"
    />
     
        />
    </svg>
    </div>
  </div>
       `;

  const container = document.getElementById("candleChart");
  const coordinate = candleSeries?.priceToCoordinate(candlePrice.high);

  const toolTipWidth = 80;
  const toolTipHeight = 80;
  const toolTipMargin = 35;

  let shiftedCoordinate = currentPointX - 50;
  if (coordinate === null || coordinate === undefined) {
    return;
  }
  shiftedCoordinate = Math.max(
    0,
    Math.min(container!.clientWidth - toolTipWidth, shiftedCoordinate)
  );
  const coordinateY =
    coordinate - toolTipHeight - toolTipMargin > 0
      ? coordinate - toolTipHeight - toolTipMargin
      : Math.max(
          0,
          Math.min(
            container!.clientHeight - toolTipHeight - toolTipMargin,
            coordinate + toolTipMargin
          )
        );
  toolTip.style.left = shiftedCoordinate + "px";
  toolTip.style.top = coordinateY + "px";
};
