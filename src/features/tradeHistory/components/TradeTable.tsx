import React, { useEffect, useRef } from "react";

import Link from "next/link";

import moment from "moment";

type DailyTrade = {
  Symbol: string;
  Profit: number;
  openTimeStamp: string;
  closeTimeStamp: string | null;
};
interface Props {
  trades: DailyTrade[] | undefined;
  handleNextTrades: () => Promise<void>;
}

export const TradeTable = ({ trades, handleNextTrades }: Props) => {
  const tableRef = useRef<HTMLTableElement | null>(null);
  useEffect(() => {
    if (tableRef.current) {
      const container = tableRef.current;

      const handleScroll = () => {
        if (
          container.scrollTop + container.clientHeight >=
          container.scrollHeight
        ) {
          void handleNextTrades();
        }
      };

      container.addEventListener("scroll", handleScroll);

      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-h-[48rem]  overflow-y-scroll" ref={tableRef}>
      <table className="table table-zebra  table-pin-rows table-lg flex  bg-primary-content">
        <thead>
          <tr>
            <th></th>
            <th>Symbol</th>
            <th>Date/Time</th>
            <th>PnL</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trades?.map(
            ({ Symbol, openTimeStamp, closeTimeStamp, Profit }, index) => (
              <tr className="" key={index}>
                <td>{index + 1}</td>
                <td>{Symbol}</td>
                <td>
                  {moment(openTimeStamp).format("MMMM Do YYYY")}
                  <br />
                  <span className="badge-ghost badge-sm hidden md:badge">
                    {`${moment(openTimeStamp).format("h:mm:ss a")} -> ${moment(
                      closeTimeStamp
                    ).format("h:mm:ss a")}`}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge badge-outline px-5 py-4 ${
                      Profit > 0 ? "badge-success" : "badge-error"
                    }`}
                  >
                    ${Math.abs(Profit)}
                  </span>
                </td>
                <td>
                  <button className="btn btn-ghost btn-xs">
                    <Link
                      href={{
                        pathname: `/trades/${Symbol}`,
                        query: {
                          date: moment(openTimeStamp).format("YYYY-MM-DD"),
                        },
                      }}
                    >
                      details
                    </Link>
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};
