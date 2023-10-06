import React from "react";
import { useCSVReader } from "react-papaparse";

import { api } from "~/utils/api";

import { arrayCsvSchema, dataBaseTradeArraySchema } from "../types";
import { formatTradeCsvData, getValidCsvData } from "../utils";

interface CsvObject {
  data: unknown[];
  error: unknown;
  meta: unknown;
}
export const CsvFileUpload = () => {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  const { CSVReader } = useCSVReader();

  const mutation = api.trades.addTrades.useMutation();

  const handleOnDrop = (input: CsvObject) => {
    const { data, error } = input;
    //TODO: Refactor Error Handling for UI
    console.log(
      "🚀 ~ file: csvFileUpload.tsx:19 ~ handleOnDrop ~ error:",
      error
    );

    const result = arrayCsvSchema.safeParse(getValidCsvData(data));

    if (result.success) {
      const { data } = result;
      const dbTrades = dataBaseTradeArraySchema.parse(formatTradeCsvData(data));

      mutation.mutate(dbTrades);
    } else {
      //TODO: Refactor Error Handling for UI
      console.error("Validation Error:", result.error);
    }
  };
  return (
    <CSVReader
      config={{
        header: true,
        dynamicTyping: true,
      }}
      onUploadAccepted={(result: CsvObject) => handleOnDrop(result)}
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
        getRemoveFileProps,
      }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any) => (
        <div>
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
          <button className="btn btn-outline btn-primary" {...getRootProps()}>
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
