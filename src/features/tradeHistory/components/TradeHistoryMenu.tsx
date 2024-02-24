import React from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import ArrowLeft from "~/components/icons/ArrowIcon";
import { useAppStore } from "~/hooks/useAppStore";
import { api } from "~/utils/api";

import { DateRangeSchema } from "../types";
import { generateDateRangeUrl } from "../utils";
import { CsvFileUpload } from "./CsvFileUpload";
import { DateRangeButton } from "./DateRangeButton";
import { TradeFilterSelect } from "./TradeFilterSelect";

export const TradeHistoryMenu = () => {
  const router = useRouter();
  const filterTag = router.query.filter as string;

  const updateTagType = useAppStore((state) => state.updateTagType);
  const updateSelectedTag = useAppStore((state) => state.updateTagId);

  const { data: tagData } = api.tags.getTagsByFilter.useQuery(filterTag, {});

  const handleDateChange = (dates: unknown) => {
    const currentUrl = router.pathname;
    const [start, end] = DateRangeSchema.parse(dates);

    const filter = filterTag ?? null;

    const newUrl = generateDateRangeUrl(currentUrl, start, end, filter);

    void router.replace(newUrl, undefined, { shallow: true });
  };

  const handleRemoveFilter = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { filter, ...currentQuery } = router.query;

    await router.push({
      pathname: router.pathname,
      query: currentQuery,
    });
  };
  const resetTagState = () => {
    updateSelectedTag(null);
    updateTagType("all");
  };

  return (
    <>
      <div className="mb-5 flex self-end">
        <CsvFileUpload />
      </div>
      <div className="relative my-9 flex w-full justify-between ">
        <div className="flex space-x-10">
          <button className="btn flex w-40" onClick={() => resetTagState()}>
            <Link className="flex items-center space-x-5" href={"/"}>
              <ArrowLeft />
              <span>Back</span>
            </Link>
          </button>
          {filterTag && (
            <div>
              <span>Filtered By: </span>
              <button className="btn ml-3">
                {tagData?.tagName}
                <svg
                  onClick={() => void handleRemoveFilter()}
                  className="ml-3 h-3 w-3 text-white hover:opacity-80"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>
            </div>
          )}
          <TradeFilterSelect />
        </div>

        <DateRangeButton passDateChange={handleDateChange} />
      </div>
    </>
  );
};
