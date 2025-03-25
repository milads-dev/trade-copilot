import React from "react";

import AnimatedDiv from "./AnimatedDiv";
import { TRADE_PLATFORMS } from "./constants";

interface Props {
  direction: number;
  tradePlatform: string;
  onPlatformSelect: (name: string) => void;
}

const TradePlatformSelector: React.FC<Props> = ({
  direction,
  tradePlatform,
  onPlatformSelect,
}) => {
  return (
    <AnimatedDiv direction={direction}>
      <div className="h-[30rem] overflow-scroll pt-5 xl:h-[37rem]">
        <h1 className="ml-5 text-xl">Select your platform</h1>
        <div className="m-4 grid grid-cols-1 justify-center gap-x-6 gap-y-5 sm:grid-cols-2 lg:p-0 xl:grid-cols-3">
          {TRADE_PLATFORMS.map((platform) => (
            <div
              key={platform.name}
              className={`card image-full h-40 w-full cursor-pointer bg-base-100 shadow-xl ${
                tradePlatform === platform.schemaType
                  ? "ring-4 ring-blue-500"
                  : ""
              } hover:ring-2 hover:ring-blue-300`}
              onClick={() => onPlatformSelect(platform.schemaType)}
            >
              <figure className="z-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={platform.url}
                  alt={platform.name}
                  className="w-full object-cover opacity-80"
                />
              </figure>
            </div>
          ))}
        </div>
      </div>
    </AnimatedDiv>
  );
};

export default TradePlatformSelector;
