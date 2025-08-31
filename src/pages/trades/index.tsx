import React from "react";
import "react-calendar/dist/Calendar.css";

import { type GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import { Drawer } from "~/components/auth/Drawer";
import CsvLoader from "~/components/modals/CsvUpload/CsvLoader";
import { TradeHistoryMenu, TradeTable } from "~/features/tradeHistory";
import { api } from "~/utils/api";

const Trades = () => {
  const router = useRouter();
  const startDate = router.query.from as string;
  const endDate = router.query.to as string;
  const filterTag = router.query.filter as string;

  const { data, isLoading, fetchNextPage } =
    api.trades.getTrades.useInfiniteQuery(
      { startDate, endDate, filterTag },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        refetchOnWindowFocus: false,
      }
    );

  const handleNextTrades = async () => {
    await fetchNextPage();
  };

  const trades = data?.pages.flatMap((page) => page?.trades ?? []);
  const profitOrLoss = trades?.reduce(
    (accum, currentTrade) => accum + currentTrade.Profit,
    0
  );

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
                  width={400}
                  height={100}
                />
                <span>No Trades Found</span>
              </div>
            )}
            <div className="w=full text-center">
              <div className="stats mt-5 bg-primary-content">
                <div className="stat">
                  <div className="stat-title">
                    Total {profitOrLoss && profitOrLoss > 0 ? "Profit" : "Loss"}
                  </div>
                  <div className="stat-value">
                    {profitOrLoss &&
                      (profitOrLoss > 0 ? (
                        <div className="text-primary">
                          ${Math.abs(profitOrLoss).toFixed(2)}
                        </div>
                      ) : (
                        <div className="text-error">
                          $({Math.abs(profitOrLoss).toFixed(2)})
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <CsvLoader />
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Trades;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const session = await getSession({ req });

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
