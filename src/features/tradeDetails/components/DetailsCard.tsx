import React, { useState } from "react";

import { useRouter } from "next/router";

import type { DailyTrades } from "../type";
import { TradeDetails } from "./TradeDetails";
import { TradeNotes } from "./TradeNotes";

interface Props {
  trades?: DailyTrades;
}

export const DetailsCard = ({ trades }: Props) => {
  const router = useRouter();

  const symbol = router.query.symbol as string;
  const date = router.query.date as string;
  const [tagType, setTagType] = useState("details");

  return (
    <div className="card mr-10 w-full bg-base-200 pr-5">
      <div className="card-body w-full">
        <div>
          <div className="tabs justify-between self-center">
            {["details", "notes"].map((tab) => (
              <p
                key={tab}
                className={`tab tab-bordered uppercase ${
                  tagType === tab ? "tab-active" : ""
                }`}
                onClick={() => setTagType(tab)}
              >
                {tab}
              </p>
            ))}
          </div>
        </div>
        {tagType === "details" && (
          <TradeDetails trades={trades} symbol={symbol} date={date} />
        )}
        {tagType === "notes" && (
          <div className="mt-5 self-center">
            <TradeNotes />
          </div>
        )}
      </div>
    </div>
  );
};
