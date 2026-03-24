import React from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import ArrowLeft from "~/components/icons/ArrowIcon";
import { CsvUploadModal } from "~/components/modals";
import { useAppStore } from "~/hooks/useAppStore";
import { api } from "~/utils/api";

import { DateRangeSchema } from "../types";
import { generateDateRangeUrl } from "../utils";
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

  const openCsvUploadModal = () => {
    const modal = document.getElementById(
      "csv_upload_modal"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
  };

  return (
    <>
      <div className="flex self-end mb-5">
        <button
          className="btn btn-primary"
          onClick={() => openCsvUploadModal()}
        >
          Import Trades
        </button>
        <CsvUploadModal />
      </div>
      <div className="relative flex justify-between my-9 w-full">
        <div className="flex space-x-10">
          <button className="flex w-40 btn" onClick={() => resetTagState()}>
            <Link className="flex items-center space-x-5" href={"/"}>
              <ArrowLeft />
              <span>Back</span>
            </Link>
          </button>
          {filterTag && (
            <div>
              <span>Filtered By: </span>
              <button className="ml-3 btn">
                {tagData?.tagName}
                <svg
                  onClick={() => void handleRemoveFilter()}
                  className="hover:opacity-80 ml-3 w-3 h-3 text-white"
                  aria-hidden="true"
                  aria-label="Remove"
                  data-testid="remove-tag-button"
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
