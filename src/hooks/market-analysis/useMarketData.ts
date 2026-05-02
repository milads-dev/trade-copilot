import { useEffect, useState } from "react";

import { type ChartData } from "~/features/tradeDetails";

export const useMarketData = (symbol: string, dateId: string) => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const loadMarketData = async () => {
      try {
        if (!symbol || !dateId) {
          return;
        }
        const response = await fetch(`/data/${symbol}/${dateId}.json`);

        if (!response.ok) {
          setData([]);
          setLoading(true);
        }

        const jsonData = (await response.json()) as ChartData[];

        if (!isCancelled) {
          const sortedData = jsonData.sort(
            (a: ChartData, b: ChartData) => a.time - b.time
          );
          setData(sortedData);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setData([]);
          setError((err as Error).message);
          setLoading(true);
        }
      }
    };
    void loadMarketData();

    return () => {
      isCancelled = true;
    };
  }, [symbol, dateId]);

  return { data, loading, error };
};
