import React from "react";

import { useRouter } from "next/router";

import { api } from "~/utils/api";

import type { DailyTrades } from "../type";
import { formatDateForDetails } from "../utils";
import { TagSelect } from "./TagSelect";

interface Props {
  trades?: DailyTrades;
}

export const DetailsCard = ({ trades }: Props) => {
  const router = useRouter();

  const symbol = router.query.symbol as string;
  const date = router.query.date as string;

  const { data } = api.tags.getTags.useQuery(
    { symbol, date },
    {
      refetchOnWindowFocus: false,
    }
  );

  const tradePnL = trades?.reduce(
    (accumulator, currentTrade) => accumulator + currentTrade.Profit,
    0
  );

  const { allTags, tradeTags } = data ?? {};

  return (
    <div className="card mr-10 w-full bg-base-200 pr-5">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title">Symbol:</h2>
          <span className="card-title ml-2">{symbol}</span>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <h3 className="card-title">PnL Realized:</h3>
          {tradePnL ? (
            <span
              className={`card-title ml-2 ${
                tradePnL > 0 ? "text-success" : "text-error"
              } `}
            >
              ${tradePnL}
            </span>
          ) : null}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <h3 className="card-title">Date:</h3>
          <span className="card-title ml-2">{formatDateForDetails(date)}</span>
        </div>
        <div className="card-title mt-10">Setup</div>
        <TagSelect
          value={tradeTags?.setup}
          options={allTags?.setup}
          tagType="setup"
        />

        <div className="card-title mt-4">Mistake</div>
        <TagSelect
          value={tradeTags?.mistake}
          options={allTags?.mistake}
          tagType="mistake"
        />

        <div className="card-title mt-4">Custom</div>
        <TagSelect
          value={tradeTags?.custom}
          options={allTags?.custom}
          tagType="custom"
        />
      </div>
    </div>
  );
};
