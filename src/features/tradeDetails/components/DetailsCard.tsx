import React from "react";

import { useRouter } from "next/router";

import { api } from "~/utils/api";

import type { DailyTrades, DetailsCardTag } from "../type";
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

  const TAGS: DetailsCardTag[] = [
    {
      type: "Setup",
      className: "card-title mt-10",
      value: tradeTags?.setup,
      options: allTags?.setup,
    },
    {
      type: "Mistake",
      className: "card-title mt-4",
      value: tradeTags?.mistake,
      options: allTags?.mistake,
    },
    {
      type: "Custom",
      className: "card-title mt-4",
      value: tradeTags?.custom,
      options: allTags?.custom,
    },
  ];

  return (
    <div className="card mr-10 w-full bg-base-200 pr-5">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="card-title">Symbol:</div>
          <span className="card-title ml-2">{symbol}</span>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div className="card-title">PnL Realized:</div>
          {tradePnL &&
            (tradePnL > 0 ? (
              <span className="card-title text-success">${tradePnL}</span>
            ) : (
              <span className="card-title  text-error">
                $({Math.abs(tradePnL).toFixed(2)})
              </span>
            ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div className="card-title">Date:</div>
          <span className="card-title ml-2">{formatDateForDetails(date)}</span>
        </div>
        {TAGS.map(({ value, options, type, className }) => (
          <div key={type}>
            <div className={className}> {type}</div>
            <TagSelect value={value} options={options} tagType={type} />
          </div>
        ))}
      </div>
    </div>
  );
};
