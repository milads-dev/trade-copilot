import React from "react";

import { api } from "~/utils/api";

interface Props {
  symbol: string;
  date: string;
  tradePnL: number | undefined;
}

export const TradeRating = ({ symbol, date, tradePnL }: Props) => {
  const ctx = api.useContext();
  const { data: tradeDetails } = api.tradeDetails.getTradeDetails.useQuery(
    { symbol, date },
    {
      refetchOnWindowFocus: false,
    }
  );

  const { rating } = tradeDetails ?? {};

  const addTradeRating = api.tradeDetails.addTradeRating.useMutation({
    onSuccess: () =>
      ctx.tradeDetails.getTradeDetails.invalidate({ symbol, date }),
  });
  return (
    <div className="rating rating-md">
      <input
        readOnly
        type="radio"
        name="rating-0"
        className="rating-hidden"
        checked={rating == null}
        onClick={() =>
          addTradeRating.mutate({
            symbol,
            date,
            rating: null,
          })
        }
      />
      {Array.from({ length: 5 }, (_, index) => (
        <input
          readOnly
          type="radio"
          name={`rating-${index}`}
          key={index}
          className={`mask mask-star ${
            tradePnL && tradePnL > 0 ? "bg-success" : "bg-error"
          }`}
          checked={rating == index + 1}
          onClick={() =>
            addTradeRating.mutate({
              symbol,
              date,
              rating: index + 1,
            })
          }
        />
      ))}
    </div>
  );
};
