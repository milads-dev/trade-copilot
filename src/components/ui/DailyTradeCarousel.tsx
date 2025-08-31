import { useState } from "react";

import { api } from "~/utils/api";

import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";

import { motion } from "framer-motion";

import { DayTradingCard } from "./DayTradingCard";

const CARD_WIDTH = 220;
const CARD_GAP = 20;
const INITIAL_VISIBLE = 3;
const MAX_STACKED = 5;
const CASCADE_OFFSET = 30;

export default function DailyTradeCarousel() {
  const [index, setIndex] = useState(0);

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isInitialLoading,
    isLoading,
  } = api.trades.getInfiniteChartData1.useInfiniteQuery(
    { limit: 2 }, // Load more items at once
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  console.log("🚀 ~ DailyTradeCarousel ~ isLoading:", isLoading);
  console.log("🚀 ~ DailyTradeCarousel ~ isInitialLoading:", isInitialLoading);
  console.log(
    "🚀 ~ DailyTradeCarousel ~ isFetchingNextPage:",
    isFetchingNextPage
  );

  const flatData = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  const stackCount = Math.min(index, MAX_STACKED);
  const start = Math.max(0, index - stackCount);
  const end = index + INITIAL_VISIBLE;
  const visibleCards = flatData.slice(start, end);

  const handleNext = async () => {
    const nearEnd = index + INITIAL_VISIBLE >= flatData.length;

    if (nearEnd && hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }

    if (index + 1 < flatData.length) {
      setIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (index > 0) {
      setIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="h-full w-full py-14">
      <div className="flex w-full flex-col items-center space-y-4">
        <div className="ml-24 mt-12 flex w-full flex-col text-3xl">
          <h1>Recent trades</h1>
          <h1 className="">{`Jul 7–11, 2025`}</h1>
        </div>

        <div className="ml-52 flex w-full flex-row justify-end gap-3 pt-5">
          <button
            className="relative z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={handleBack}
            disabled={index <= 0}
          >
            <IconArrowNarrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <button
            className="relative z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={handleNext}
            disabled={index + 1 >= flatData.length && !hasNextPage}
          >
            <IconArrowNarrowRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="relative h-[44rem] w-[44rem] overflow-x-scroll rounded-md p-4">
          {visibleCards.map((card, i) => {
            const globalCardIndex = start + i;
            const isStacked = globalCardIndex < index;
            const isTopStacked = globalCardIndex === index - 1;
            const isDeepStacked = isStacked && !isTopStacked;

            let x = 0;
            let zIndex = 0;

            if (isStacked) {
              const stackedOrder = globalCardIndex;
              x = (globalCardIndex - (index - stackCount)) * CASCADE_OFFSET;
              zIndex = 100 + stackedOrder;
            } else {
              const sideIndex = globalCardIndex - index;
              x =
                CASCADE_OFFSET * Math.max(0, stackCount - 1) +
                sideIndex * (CARD_WIDTH + CARD_GAP);
              zIndex = 1000 - sideIndex;
            }

            return (
              <motion.div
                key={globalCardIndex}
                layout
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute -top-16 mx-10 flex h-full w-[500px] items-center justify-center rounded-md text-white"
                style={{ zIndex }}
              >
                <DayTradingCard
                  card={card}
                  // lineData={card.chartData}
                  isDeepStacked={isDeepStacked}
                />
              </motion.div>
            );
          })}
        </div>
        <button
          onClick={() => console.log("SyntaxUI is the best!")}
          className={"group/button rounded-lg bg-[#ffffff] text-black"}
        >
          <span
            className={
              "block -translate-x-1 -translate-y-1 rounded-lg border-2 border-[#ffffff] bg-[#ff527a] px-6 py-1 text-xl font-medium tracking-tight transition-all group-hover/button:-translate-y-2 group-active/button:translate-x-0 group-active/button:translate-y-0"
            }
          >
            Next
          </span>
        </button>
      </div>
    </div>
  );
}
