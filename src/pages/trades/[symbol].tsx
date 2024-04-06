import { useReducer } from "react";
import "react-calendar/dist/Calendar.css";

import { type GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

import { CandleStickChart } from "~/components/charts/CandleStickChart";
import ArrowLeft from "~/components/icons/ArrowIcon";
import { TradeMarkerTable } from "~/components/tables/TradeMarkerTable";
import { DetailsCard, TradeNavigationButtons } from "~/features/tradeDetails";
import { useAppStore } from "~/hooks/useAppStore";
import { initialState, reducer } from "~/hooks/useChartMarkers";
import { api } from "~/utils/api";

const Symbol = () => {
  const router = useRouter();

  const symbol = router.query.symbol as string;
  const date = router.query.date as string;

  const tradeHistoryUrl = useAppStore((state) => state.tradeHistoryUrl);

  const { data, isSuccess } = api.trades.getTradesByDate.useQuery(
    { symbol: symbol, date: date },
    {
      refetchOnWindowFocus: false,
    }
  );

  const { dailyTrades, lastTrade, nextTrade } = data ?? {};
  const reversedTrades = dailyTrades ? [...dailyTrades].reverse() : [];

  const [state, dispatch] = useReducer(reducer, initialState);

  const { selectedMarkers } = state;

  return (
    <>
      <Head>
        <title>Trade Details</title>
        <meta name="description" content="The Trade Details Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col space-y-5 p-10">
        <div className="flex w-full items-center justify-between">
          <button
            className="btn w-40"
            onClick={() => void router.push(tradeHistoryUrl ?? "/trades")}
          >
            <ArrowLeft />
            Back
          </button>
          <TradeNavigationButtons
            dispatch={dispatch}
            lastTrade={lastTrade}
            nextTrade={nextTrade}
          />
        </div>

        <div className="z-10">
          <div className="flex w-full flex-col xl:flex-row xl:space-x-5">
            <div className="order-2 mt-5 w-[100%] xl:order-1 xl:mt-0 xl:w-[40%]">
              <DetailsCard trades={dailyTrades} isSuccess={isSuccess} />
            </div>
            <div className="xl:order2 order-1 w-[100%] xl:w-[60%]">
              <CandleStickChart chartMarkers={selectedMarkers} />
            </div>
          </div>
        </div>
        <TradeMarkerTable
          trades={reversedTrades}
          state={state}
          dispatch={dispatch}
        />
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
