"use client";

import React, { useEffect, useRef, useState } from "react";

import { api } from "~/utils/api";
import { cn } from "~/utils/utils";

import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";

import { motion } from "framer-motion";

// <-- update this path if needed
import { DayTradingCard } from "./DayTradingCard";
import { ThemeController } from "./ThemeController";

interface CarouselProps {
  initialScroll?: number;
}

export const Carousel = ({ initialScroll = 0 }: CarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  //   api.trades.getCarouselTrades.useInfiniteQuery(
  //     {
  //       limit: 3,
  //     },
  //     {
  //       getNextPageParam: (lastPage) => lastPage.nextCursor,
  //       refetchOnWindowFocus: false,
  //       staleTime: 1000 * 60 * 5,
  //     }
  //   );
  const { data } = api.trades.getRecentTradeCharts.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
  console.log("🚀 ~ Carousel ~ data:", data);

  // const allTrades = data?.pages.flatMap((page) => page.items) ?? [];

  useEffect(() => {
    const slider = carouselRef.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const mouseDown = (e: MouseEvent) => {
      isDown = true;
      slider.classList.add("cursor-grabbing");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const mouseLeave = () => {
      isDown = false;
      slider.classList.remove("cursor-grabbing");
    };

    const mouseUp = () => {
      isDown = false;
      slider.classList.remove("cursor-grabbing");
    };

    const mouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5;
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", mouseDown);
    slider.addEventListener("mouseleave", mouseLeave);
    slider.addEventListener("mouseup", mouseUp);
    slider.addEventListener("mousemove", mouseMove);

    return () => {
      slider.removeEventListener("mousedown", mouseDown);
      slider.removeEventListener("mouseleave", mouseLeave);
      slider.removeEventListener("mouseup", mouseUp);
      slider.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    const el = carouselRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
  };

  const handleScroll = () => {
    checkScrollability();

    const el = carouselRef.current;
    // if (!el || isFetchingNextPage || !hasNextPage) return;

    // const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 50;
    // if (nearEnd) {
    //   fetchNextPage();
    // }
  };

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="relative w-full">
      <div className="mx-5 flex justify-between gap-2">
        <h2 className="max-w-7xl font-sans text-xl font-bold text-neutral-800 dark:text-neutral-200 md:text-5xl">
          Get to know your iSad.
        </h2>
        <ThemeController />
        <div className="flex gap-3">
          <button
            className="relative z-40 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <button
            className="relative z-40 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <IconArrowNarrowRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div
        className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20"
        ref={carouselRef}
        onScroll={handleScroll}
      >
        <div
          className={cn("flex flex-row justify-start gap-4 pl-4", "mx-auto")}
        >
          {data?.map((trade, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.5,
                  delay: 0.2 * index,
                  ease: "easeOut",
                },
              }}
              key={`card-${index}`}
              className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
            >
              <DayTradingCard card={trade} lineData={trade.data} key={index} />
            </motion.div>
          ))}
          {/* {isFetchingNextPage && (
            <div className="flex w-60 items-center justify-center rounded-3xl bg-gray-100 text-gray-500 dark:bg-neutral-800">
              Loading more...
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};
