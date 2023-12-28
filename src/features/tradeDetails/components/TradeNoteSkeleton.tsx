import React from "react";

export const TradeNoteSkeleton = () => {
  return (
    <div className="absolute z-20 h-full w-full bg-slate-900">
      <div className="flex animate-pulse flex-col">
        <div className="flex-1">
          <div className="flex h-10 items-center space-x-3 rounded bg-slate-700 px-2">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="h-6 w-10 rounded-md bg-slate-900"
              ></div>
            ))}
          </div>
          <div className="flex h-10 items-center space-x-5 rounded bg-slate-700 pl-7">
            {Array.from({ length: 14 }, (_, index) => (
              <div
                key={index}
                className="h-5 w-7 rounded-sm bg-slate-900"
              ></div>
            ))}
          </div>
        </div>
        <div className="flex h-full flex-col items-center">
          <div className=" mt-5 h-96 w-[95%] rounded-lg bg-slate-700" />
          <div className=" mt-5 h-14 w-[95%] rounded-full bg-slate-700" />
        </div>
      </div>
    </div>
  );
};
