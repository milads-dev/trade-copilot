import "react-calendar/dist/Calendar.css";

import { type GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

import { CandleStickChart } from "~/components/CandleStickChart";
import ArrowLeft from "~/components/icons/ArrowLeft";
import { DetailsCard } from "~/features/tradeDetails";
import { formatUtcTimestamp } from "~/features/tradeHistory";
import { api } from "~/utils/api";

const Symbol = () => {
  const router = useRouter();

  const symbol = router.query.symbol as string;
  const date = router.query.date as string;

  const { data } = api.trades.getTradesByDate.useQuery(
    { symbol: symbol, date: date },
    {
      refetchOnWindowFocus: false,
    }
  );

  const { dailyTrades } = data ?? {};
  const reversedTrades = dailyTrades ? [...dailyTrades].reverse() : [];

  return (
    <>
      <Head>
        <title>Trade Details</title>
        <meta name="description" content="The Trade Details Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col space-y-5 p-10">
        <div className="flex w-full items-center justify-between">
          <button className="btn w-40" onClick={() => router.back()}>
            <ArrowLeft />
            Back
          </button>
        </div>

        <div className="flex justify-between">
          <DetailsCard trades={dailyTrades} />
          <CandleStickChart />
        </div>
        <div className="overflow-x-auto px-10">
          <table className="table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Time</th>
                <th>Volume</th>
                <th>Price</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {reversedTrades.map((item, index) => (
                <tr key={index}>
                  <td>{item.Symbol}</td>
                  <td>{formatUtcTimestamp(item.TimeStamp)}</td>
                  <td>{item.Volume}</td>
                  <td>{item.Price}</td>
                  <td>{item.Profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Symbol;

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
