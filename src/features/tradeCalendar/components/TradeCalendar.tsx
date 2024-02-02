import React, { useState } from "react";

import ArrowLeft from "~/components/icons/ArrowIcon";
import { TagGroupAvatar, getTradeTags } from "~/features/tradeStats";
import { useAppStore } from "~/hooks/useAppStore";
import { api } from "~/utils/api";

import { add, format, getDate, getMonth, sub } from "date-fns";

import { DAYS_IN_A_WEEK } from "../constants";
import { calculateCalendarRange, formatDate } from "../utils/helper";
import { Cell } from "./Cell";

export const TradeCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { calendarStart, calendarEnd, numDays, prefixDays, suffixDays } =
    calculateCalendarRange(currentDate);

  const startDate = formatDate(calendarStart);
  const endDate = formatDate(calendarEnd);

  const { data: tagData } = api.tags.getTagsByDateRange.useQuery(
    { startDate, endDate },
    {
      refetchOnWindowFocus: false,
    }
  );
  const { data } = api.trades.getTrades.useQuery(
    { startDate, endDate },
    {
      refetchOnWindowFocus: false,
    }
  );
  const trades = data?.trades ?? [];
  const tags = tagData?.tags ?? [];
  const selectedTagType = useAppStore((state) => state.selectedTagType);

  const prevMonth = () => setCurrentDate(sub(currentDate, { months: 1 }));
  const nextMonth = () => setCurrentDate(add(currentDate, { months: 1 }));

  const isCurrentDay = (day: number) =>
    day === getDate(new Date()) &&
    getMonth(currentDate) === getMonth(new Date());

  return (
    <div className="mt-7 w-[70rem] self-end border-l border-t bg-base-200">
      <div className="grid grid-cols-7 items-center justify-center text-center ">
        <div className="col-span-7 flex select-none items-center justify-between border-b border-r p-3 text-white">
          <span
            className="cursor-pointer hover:animate-pulse"
            onClick={() => prevMonth()}
          >
            <ArrowLeft />
          </span>
          {format(currentDate, "LLLL yyyy")}
          <span
            className="rotate-180 cursor-pointer hover:animate-pulse"
            onClick={() => nextMonth()}
          >
            <ArrowLeft />
          </span>
        </div>
        {DAYS_IN_A_WEEK.map((week) => (
          <div key={week} className="border-b border-r">
            {week}
          </div>
        ))}
        {
          <>
            {Array.from({ length: prefixDays }).map((_, index) => (
              <Cell key={index} isDisabled />
            ))}

            {Array.from({ length: numDays }).map((_, index) => {
              const trade = trades.find(
                (trade) => index + 1 === getDate(new Date(trade.openTimeStamp))
              );
              const tradeTags = getTradeTags(tags, index, selectedTagType);

              if (trade) {
                const highlightColor =
                  trade.Profit > 0
                    ? "bg-success-content"
                    : trade.Profit < 0
                    ? "bg-error-content"
                    : "";
                return (
                  <Cell
                    key={index}
                    highlightColor={highlightColor}
                    date={new Date(trade.openTimeStamp)}
                  >
                    <span
                      className={`${
                        isCurrentDay(index + 1) ? "underline" : ""
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="ml-9 w-full text-right">
                      {trade.Profit}
                    </span>
                    <TagGroupAvatar tradeTags={tradeTags} />
                  </Cell>
                );
              } else {
                return (
                  <Cell key={index} isDisabled>
                    <span
                      className={`${
                        isCurrentDay(index + 1) ? "underline" : ""
                      }`}
                    >
                      {index + 1}
                    </span>
                  </Cell>
                );
              }
            })}

            {Array.from({ length: suffixDays }).map((_, index) => (
              <Cell key={index} isDisabled />
            ))}
          </>
        }
      </div>
    </div>
  );
};
