import React from "react";
import { useCSVReader } from "react-papaparse";

import { api } from "~/utils/api";

import { type z } from "zod";

import {
  topStepArrayCsvSchema,
  unionArrayCsvSchema,
} from "../../../features/tradeHistory/types";
import {
  getValidCsvData,
  transformCsvData,
} from "../../../features/tradeHistory/utils";
import { type TradeDetails } from "../types";

interface CsvObject {
  data: unknown[];
  error: unknown;
  meta: unknown;
}

type ParentProps = {
  setTradeData: React.Dispatch<React.SetStateAction<TradeDetails[]>>;
  tradeSchema: string;
};

const schemaMap: Record<string, z.Schema> = {
  topStep: topStepArrayCsvSchema,
  metaTrader: unionArrayCsvSchema,
  ibkr: unionArrayCsvSchema,
};
export const CsvFileUpload: React.FC<ParentProps> = ({
  tradeSchema,
  setTradeData,
}) => {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  const { CSVReader } = useCSVReader();
  const ctx = api.useContext();

  const mutation = api.trades.addTrades.useMutation({
    onSuccess: () => ctx.trades.invalidate(),
  });

  const handleOnDrop = (input: CsvObject, tradeSchema: string) => {
    const { data } = input;
    const selectedSchema = schemaMap[tradeSchema];

    if (selectedSchema) {
      const result = selectedSchema.safeParse(
        getValidCsvData(data, tradeSchema)
      );

      if (result.success) {
        const transformTradeData = transformCsvData(
          result.data as unknown[],
          tradeSchema
        );

        if (transformTradeData !== null && transformTradeData.length > 0)
          setTradeData(transformTradeData);
        else {
          alert("Wrong Trade Format");
        }
      }
    }
  };

  return (
    <CSVReader
      config={{
        header: true,
        dynamicTyping: true,
      }}
      onUploadAccepted={(result: CsvObject) =>
        handleOnDrop(result, tradeSchema)
      }
    >
      {({
        getRootProps,
        _acceptedFile,
        _ProgressBar,
        _getRemoveFileProps,
      }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any) => (
        <div>
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
          <button className="btn btn-primary w-full" {...getRootProps()}>
            <span>Import CSV</span>
            {mutation.isLoading ? (
              <span className="loading loading-dots loading-md"></span>
            ) : (
              <svg
                width="24px"
                height="24px"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            )}
          </button>
        </div>
      )}
    </CSVReader>
  );
};
