import { type GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

import { TradeHistoryPage } from "~/features/tradeHistory";

export default function Trades() {
  return <TradeHistoryPage />;
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const session = await getSession({ req });

  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  return { props: {} };
}
