import "react-calendar/dist/Calendar.css";

import { type GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

import { CandleStickChart } from "~/components/CandleStickChart";
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

  return (
    <>
      <Head>
        <title>Trade History</title>
        <meta name="description" content="The Trade History Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col space-y-5 p-10">
        <button className="btn" onClick={() => router.back()}>
          Go Back
        </button>

        <div className="flex justify-between">
          <DetailsCard trades={dailyTrades} />
          <CandleStickChart />
        </div>
        {dailyTrades?.length !== 0 ? (
          <ul className="grid grid-cols-2 items-center gap-4">
            {dailyTrades?.map((item, index) => (
              <li className="" key={index}>
                <p>{`Symbol: ${item.Symbol}`}</p>
                <p>{`TimeStamp: ${formatUtcTimestamp(item.TimeStamp)}`}</p>
                <p>{`Volume: ${item.Volume}`}</p>
                <p>{`Price: ${item.Price}`}</p>
                <p>{`Profit: ${item.Profit}`}</p>
              </li>
            ))}
          </ul>
        ) : null}
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
