import React, { useState } from "react";

import { api } from "~/utils/api";

import { AnimatePresence, motion } from "framer-motion";

import { type TradeDetails } from "../types";
import CsvTradeTable from "./CsvTradeTable";
import CsvUploadSuccess from "./CsvUploadSuccess";
import TradePlatformSelector from "./TradePlatformSelector";

export const CsvUploadModal = () => {
  const [slideDirection, setDirection] = useState(1);
  const [tradeData, setTradeData] = useState<TradeDetails[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const ctx = api.useContext();
  const mutation = api.trades.addTrades.useMutation({
    onSuccess: () => ctx.trades.invalidate(),
  });

  const handleNextStep = () => {
    if (currentStep === 1 && Array.isArray(tradeData) && tradeData.length > 0) {
      mutation.mutate(tradeData);
    }

    setCurrentStep((prev) => {
      setDirection(1);
      return prev + 1;
    });
  };

  const handlePrevStep = () => {
    if (currentStep === 1) setTradeData([]);
    setCurrentStep((prev) => {
      setDirection(-1);
      return prev - 1;
    });
  };

  const [tradePlatform, setTradePlatform] = useState("");

  const handlePlatformSelect = (TradePlatform: string) => {
    setTradePlatform(TradePlatform);
  };

  const handleModalClose = () => {
    setCurrentStep(0);
    setTradePlatform("");
    setTradeData([]);
  };

  return (
    <motion.dialog id="csv_upload_modal" className="modal">
      <div className="max-w-5xl h-[80%] modal-box">
        <form method="dialog">
          <button
            className="top-[40px] right-2 absolute btn btn-circle btn-ghost btn-sm"
            onClick={() => handleModalClose()}
          >
            ✕
          </button>
        </form>

        <div className="flex flex-col justify-between items-center xl:items-start h-full">
          <div className="space-y-5 w-full">
            <AnimatePresence mode="wait">
              {currentStep === 0 ? (
                <TradePlatformSelector
                  tradePlatform={tradePlatform}
                  onPlatformSelect={handlePlatformSelect}
                  direction={slideDirection}
                  key={"one"}
                />
              ) : null}
              {currentStep === 1 ? (
                <CsvTradeTable
                  direction={slideDirection}
                  tradeData={tradeData}
                  tradePlatform={tradePlatform}
                  setTradeData={(data) => setTradeData(data)}
                  key={"two"}
                />
              ) : null}
              {currentStep === 2 ? (
                <CsvUploadSuccess
                  direction={slideDirection}
                  tradeData={tradeData}
                  handleModalClose={() => handleModalClose()}
                  key={"three"}
                />
              ) : null}
            </AnimatePresence>

            {currentStep !== 2 ? (
              <div className="flex justify-between w-full">
                <button
                  className="bottom-5 left-7 absolute btn-outline btn btn-error"
                  disabled={currentStep === 0}
                  onClick={handlePrevStep}
                >
                  Prev Step
                </button>
                <button
                  className="right-7 bottom-5 absolute btn-outline btn btn-info"
                  onClick={handleNextStep}
                  disabled={
                    tradePlatform === "" ||
                    (currentStep === 1 && !tradeData.length)
                  }
                >
                  Next Step
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.dialog>
  );
};
