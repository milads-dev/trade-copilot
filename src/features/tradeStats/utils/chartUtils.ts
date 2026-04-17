export const getChartColors = (data: { value: number }[]) => {
  const lastValue = data[data.length - 1]?.value ?? 0;
  const isProfitable = lastValue >= 0;

  return {
    topColor: isProfitable ? "rgba(46, 220, 135, 0.4)" : "rgba(220, 0, 0, 0.7)",
    bottomColor: isProfitable
      ? "rgba(40, 221, 100, 0)"
      : "rgba(220, 46, 46, 0.1)",
    lineColor: isProfitable ? "#33D778" : "#e43030",
  };
};

export const formatTooltipValue = (value: number) => {
  if (value > 0) return { text: `$${value.toFixed(2)}`, color: "green" };
  if (value < 0)
    return { text: `$(${Math.abs(value).toFixed(2)})`, color: "red" };
  return { text: `$${value.toFixed(2)}`, color: "white" };
};
