import React, { type ReactNode } from "react";

import { cn } from "~/utils/cn";

interface ChartLayoutContainerProps {
  children: ReactNode;
  isLoading: boolean;
  isFullWidth?: boolean;
  className?: string;
}

export const ChartLayoutContainer = ({
  children,
  isLoading,
  isFullWidth = false,
  className, // Destructure it
}: ChartLayoutContainerProps) => {
  const widthClass = isFullWidth
    ? "w-full"
    : "w-[24rem] min-[1920px]:w-[36rem]";

  return (
    <section className="relative">
      <div
        className={cn(
          "z-10 bg-base-200 mt-16 p-3 rounded-3xl h-96 transition-all duration-300",
          widthClass,
          className
        )}
      >
        {isLoading ? (
          <div className="flex justify-center items-center w-full h-full">
            <span className="text-success loading loading-infinity loading-lg" />
          </div>
        ) : (
          <div className="w-full h-full animate-in duration-500 fade-in">
            {children}
          </div>
        )}
      </div>
    </section>
  );
};
