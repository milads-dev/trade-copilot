import "react-calendar/dist/Calendar.css";

import { type GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import { Drawer } from "~/components/auth/Drawer";
import ArrowLeft from "~/components/icons/ArrowIcon";
import {
  CsvFileUpload,
  DateRangeButton,
  DateRangeSchema,
  TradeTable,
  generateDateRangeUrl,
} from "~/features/tradeHistory";
import { api } from "~/utils/api";

const Trades = () => {
  const router = useRouter();
  const startDate = router.query.from as string;
  const endDate = router.query.to as string;

  const { data, isLoading, fetchNextPage } =
    api.trades.getTrades.useInfiniteQuery(
      { startDate, endDate },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        refetchOnWindowFocus: false,
      }
    );

  const handleNextTrades = async () => {
    await fetchNextPage();
  };

  const handleDateChange = (dates: unknown) => {
    const currentUrl = router.pathname;
    const [start, end] = DateRangeSchema.parse(dates);

    const newUrl = generateDateRangeUrl(currentUrl, start, end);

    void router.replace(newUrl, undefined, { shallow: true });
  };

  const trades = data?.pages.flatMap((page) => page?.trades ?? []);

  return (
    <>
      <Head>
        <title>Trade History</title>
        <meta name="description" content="The Trade History Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Drawer>
        <div className="flex min-h-screen flex-col p-10">
          <div className="mb-5 flex self-end">
            <CsvFileUpload />
          </div>

          <div className="relative my-9 flex w-full justify-between">
            <button className="btn w-40" onClick={() => void router.push("/")}>
              <ArrowLeft />
              Back
            </button>
            <DateRangeButton passDateChange={handleDateChange} />
          </div>

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
