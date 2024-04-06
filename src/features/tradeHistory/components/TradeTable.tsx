import React, { useEffect, useRef } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { useAppStore } from "~/hooks/useAppStore";

import moment from "moment";

import type { TradeDetailsData } from "../types";

interface Props {
  trades: TradeDetailsData[] | undefined;
  handleNextTrades: () => Promise<void>;
}

export const TradeTable = ({ trades, handleNextTrades }: Props) => {
  const updateTagType = useAppStore((state) => state.updateTagType);
  const updateTradeUrl = useAppStore((state) => state.updateTradeHistoryUrl);
  const router = useRouter();

  const tableRef = useRef<HTMLTableElement | null>(null);
  useEffect(() => {
    if (tableRef.current) {
      const container = tableRef.current;

      const handleScroll = () => {
        if (
          container.scrollTop + container.clientHeight + 10 >=
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

  const updateState = () => {
    updateTagType("details");
    updateTradeUrl(router.asPath);
  };

  return (
    <div
      className={`${
        trades!.length > 8 ? "max-h-[48rem]" : "max-h-[28rem]"
      }    overflow-y-scroll`}
      ref={tableRef}
    >
      <table className="table table-zebra  table-pin-rows table-lg flex  bg-primary-content">
        <thead>
          <tr>
            <th></th>
            <th>Symbol</th>
            <th>Date/Time</th>
            <th className="pl-[3.25rem]">PnL</th>
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
                    ${Math.abs(Profit).toFixed(2)}
                  </span>
                </td>
                <td>
                  <button className="btn btn-ghost btn-xs">
                    <Link
                      onClick={() => updateState()}
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
