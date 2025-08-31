"use client";

import React from "react";

import { api } from "~/utils/api";

import { Carousel } from "./AppleCardsCarousel";
import StackingCarousel from "./DailyTradeCarousel";
import { DayTradingCard } from "./DayTradingCard";

export function AppleCardsCarouselDemo() {
  return (
    <div className="h-full w-full py-14">
      {/* <Carousel /> */}
      <StackingCarousel />
      {/* <Carousel items={newCards} /> */}
    </div>
  );
}
