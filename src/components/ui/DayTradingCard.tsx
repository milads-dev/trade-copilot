import React from "react";

import { useRouter } from "next/router";

import { useAppStore } from "~/hooks/useAppStore";

import { motion } from "framer-motion";
import { Time } from "lightweight-charts";

import { TradeLineChart } from "../charts/TradeLineChart";

type DayTradingCardProps = {
  card: {
    date: string;
    totalProfit: number;
    symbol: string;
    chartData: { time: Time; value: number }[];
  };
  isDeepStacked?: boolean;
};

export const DayTradingCard = ({
  card,
  // lineData,
  isDeepStacked,
}: DayTradingCardProps) => {
  const day = card.date.slice(-2);

  const baseBg = isDeepStacked ? "bg-opacity-50" : "bg-opacity-100";

  const router = useRouter();
  const updateTradeUrl = useAppStore((state) => state.updateTradeHistoryUrl);

  const handleClick = () => {
    router.push(`/trades/${card.symbol}?date=${card.date}`);
    updateTradeUrl(router.asPath);
  };

  return (
    <motion.div
      onClick={() => handleClick()}
      whileTap={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
      }}
      className={`relative z-10 flex h-[32rem] w-56 flex-col items-start justify-start overflow-hidden rounded-3xl ${baseBg} bg-neutral-800 md:h-[40rem] md:w-96`}
    >
      {!isDeepStacked && (
        <>
          <TradeLineChart data={card.chartData} />

          <div className="absolute  left-3 top-3 z-40 rounded bg-black/50 px-3 py-1 text-xs font-semibold text-white">
            {day}
          </div>
          <div className="absolute right-20 top-3 z-40 rounded bg-black/50 px-3 py-1 text-xs font-semibold text-white">
            {card.symbol}
          </div>
          <div
            className={`absolute bottom-3 left-3 z-40 rounded bg-black/80 px-2 py-1 text-xs font-bold ${
              card.totalProfit < 0 ? "text-red-500" : "text-green-600"
            }`}
          >
            {card.totalProfit ?? "N/A"}
          </div>
        </>
      )}
    </motion.div>
  );
};
