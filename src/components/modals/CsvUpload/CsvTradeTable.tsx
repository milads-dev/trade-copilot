import React from "react";

import moment from "moment";

import { type TradeDetails } from "../types";
import AnimatedDiv from "./AnimatedDiv";
import { CsvFileUpload } from "./CsvFileUpload";
import CsvLoader from "./CsvLoader";

interface Props {
  direction: number;
  tradeData: TradeDetails[];
  tradePlatform: string;
  setTradeData: React.Dispatch<React.SetStateAction<TradeDetails[]>>;
}
const CsvTradeTable = ({
  direction,
  tradeData,
  tradePlatform,
  setTradeData,
}: Props) => {
  const itemsToIterate = tradeData.length > 0 ? tradeData : [];

  return (
    <AnimatedDiv direction={direction}>
      <div className="h-[28rem] space-y-12">
        <h3 className="mb-10 text-lg font-bold">Preview Trades</h3>

        <div className="h-full overflow-scroll">
          <table
            className={`table table-zebra table-pin-rows table-lg 
              ${itemsToIterate.length === 0 && "opacity-50"}
              `}
          >
            <thead>
              <tr>
                <th></th>
                <th>Symbol</th>
                <th>TimeStamp</th>
                <th>Volume</th>
                <th>Price</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {itemsToIterate.length > 0
                ? itemsToIterate.map((trade, index) => (
                    <tr key={index}>
                      <th>{index + 1}</th>
                      <th>{trade.Symbol}</th>
                      <th>
                        {moment
                          .utc(trade.TimeStamp)
                          .format("MMM Do YYYY h:mm:ss a")}
                      </th>
                      <th>{trade.Volume}</th>
                      <th>{trade.Price}</th>
                      <th>{trade.Profit}</th>
                    </tr>
                  ))
                : Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index} className="">
                      <th>
                        <div className="h-4 w-4 rounded bg-gray-300"></div>
                      </th>
                      <th>
                        <div className="h-4 w-24 rounded bg-gray-300"></div>
                      </th>
                      <th>
                        <div className="h-4 w-32 rounded bg-gray-300"></div>
                      </th>
                      <th>
                        <div className="h-4 w-16 rounded bg-gray-300"></div>
                      </th>
                      <th>
                        <div className="h-4 w-20 rounded bg-gray-300"></div>
                      </th>
                      <th>
                        <div className="h-4 w-16 rounded bg-gray-300"></div>
                      </th>
                    </tr>
                  ))}
            </tbody>
          </table>
          {itemsToIterate.length === 0 && (
            <div
              className="absolute left-[40%] top-56"
              data-testid="csv-loader"
            >
              <CsvLoader />
            </div>
          )}
        </div>
        <div>
          <CsvFileUpload
            tradeSchema={tradePlatform}
            setTradeData={setTradeData}
          />
        </div>
      </div>
    </AnimatedDiv>
  );
};

export default CsvTradeTable;
