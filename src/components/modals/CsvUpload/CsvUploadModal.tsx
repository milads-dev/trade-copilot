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
    console.log(currentStep);
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
      <div className="modal-box h-[80%] max-w-5xl ">
        <form method="dialog">
          <button
            className="btn btn-circle btn-ghost btn-sm absolute right-2 top-[40px]"
            onClick={() => handleModalClose()}
          >
            ✕
          </button>
        </form>

        <div className="flex h-full flex-col items-center justify-between xl:items-start">
          <div className="w-full space-y-5">
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
              <div className="flex w-full justify-between">
                <button
                  className="btn btn-error btn-outline absolute bottom-5 left-7"
                  disabled={currentStep === 0}
                  onClick={handlePrevStep}
                >
                  Prev Step
                </button>
                <button
                  className="btn btn-info btn-outline absolute bottom-5 right-7"
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
