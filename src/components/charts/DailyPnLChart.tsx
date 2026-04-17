import { useRouter } from "next/router";

import { useThemeObserver } from "~/hooks/useThemeObserver";
import { api } from "~/utils/api";

import { type Time } from "lightweight-charts";

import { BaseLineChart } from "./BaseLineChart";
import { ChartLayoutContainer } from "./ChartLayoutContainer";

export const DailyPnLChart = () => {
  const router = useRouter();
  const currentTheme = useThemeObserver();
  const currentDate = router.query.date as string;
  const symbol = router.query.symbol as string;

  const { data, isLoading } = api.trades.getDailyPnL.useQuery(
    { currentDate, symbol },
    { refetchOnWindowFocus: false }
  );

  const formattedData =
    data?.pnlData?.map((item) => ({
      ...item,
      time: item.time as Time,
    })) ?? [];

  return (
    <ChartLayoutContainer isLoading={isLoading} isFullWidth>
      <BaseLineChart
        data={formattedData}
        currentTheme={currentTheme}
        showTime
      />
    </ChartLayoutContainer>
  );
};
