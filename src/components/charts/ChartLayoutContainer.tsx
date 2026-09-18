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
  className,
}: ChartLayoutContainerProps) => {
  const widthClass = isFullWidth
    ? "w-full"
    : "w-[24rem] min-[1920px]:w-[36rem]";

  return (
    <section className="relative">
      <div
        className={cn(
          "z-10 mt-5 h-96 rounded-3xl bg-base-200 p-3 transition-all duration-300",
          widthClass,
          className
        )}
      >
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <span className="loading loading-infinity loading-lg text-success" />
          </div>
        ) : (
          <div className="animate-in fade-in h-full w-full duration-500">
            {children}
          </div>
        )}
      </div>
    </section>
  );
};
