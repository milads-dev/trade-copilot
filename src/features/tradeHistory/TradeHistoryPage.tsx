import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import { Drawer } from "~/components/Drawer";
import { TradeHistoryMenu, TradeTable } from "~/features/tradeHistory";
import { api } from "~/utils/api";

export const TradeHistoryPage = () => {
  const router = useRouter();
  const startDate = router.query.from as string;
  const endDate = router.query.to as string;
  const filterTag = router.query.filter as string;

  const { data, isLoading, fetchNextPage } =
    api.trades.getTrades.useInfiniteQuery(
      { startDate, endDate, filterTag },
      { getNextPageParam: (lastPage) => lastPage?.nextCursor }
    );

  const trades = data?.pages.flatMap((p) => p?.trades ?? []);

  const handleNextTrades = async () => {
    await fetchNextPage();
  };
  return (
    <>
      <Head>
        <title>Trade History</title>
        <meta name="description" content="The Trade History Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Drawer>
        <div className="flex min-h-screen flex-col p-10">
          <TradeHistoryMenu />

          <div className="mx-auto h-[48rem] w-full overflow-x-auto">
            {isLoading ? (
              <div className="flex h-[80vh] flex-col items-center justify-center space-y-5">
                <Image
                  src="/assets/searchingClouds.svg"
                  alt="Searching"
                  layout="fixed"
                  width={400}
                  height={100}
                />
                <div className="animate-pulse text-white">
                  {isLoading ? "Loading..." : "No Trades Found"}
                </div>
              </div>
            ) : null}
            {trades?.length ?? 0 > 0 ? (
              <TradeTable trades={trades} handleNextTrades={handleNextTrades} />
            ) : (
              <div className="flex h-2/3 flex-col items-center justify-center space-y-8">
                <Image
                  src="/assets/not-found.svg"
                  alt="No Data"
                  layout="fixed"
                  width={400}
                  height={100}
                />
                <span>No Trades Found</span>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};
