import { useMemo } from "react";

import { useRouter } from "next/router";

import { calculateAreaChartLine } from "~/features/tradeStats";
import { useThemeObserver } from "~/hooks/useThemeObserver";
import { api } from "~/utils/api";

import { BaseLineChart } from "./BaseLineChart";
import { ChartLayoutContainer } from "./ChartLayoutContainer";

export const AreaLineChart = () => {
  const router = useRouter();
  const currentTheme = useThemeObserver();
  const { from: startDate, to: endDate } = router.query;

  const { data, isLoading } = api.trades.getStats.useQuery(
    { startDate: startDate as string, endDate: endDate as string },
    { refetchOnWindowFocus: false }
  );

  const areaData = useMemo(
    () => (data?.areaData ? calculateAreaChartLine(data.areaData) : []),
    [data]
  );

  return (
    <ChartLayoutContainer isLoading={isLoading} className="ml-20">
      <BaseLineChart data={areaData} currentTheme={currentTheme} />
    </ChartLayoutContainer>
  );
};
