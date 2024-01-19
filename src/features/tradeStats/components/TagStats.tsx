import React, { useState } from "react";

import { useRouter } from "next/router";

import { api } from "~/utils/api";

export const TagStats = () => {
  const router = useRouter();
  const startDate = router.query.from as string;
  const endDate = router.query.to as string;
  const { data, isSuccess } = api.tags.getStats.useQuery(
    { startDate, endDate },
    {
      refetchOnWindowFocus: false,
    }
  );
  const [tagType, setTagType] = useState("setup");
  const tags = data?.tags;

  const sortedTags = tags
    ? [...tags]
        .filter((tag) => {
          return tag.type === tagType;
        })
        .sort((a, b) => {
          if (b.count !== a.count) {
            return b.count - a.count;
          }
          return a.name.localeCompare(b.name);
        })
    : [];

  const tagColors: Record<string, string> = {
    setup: "step-primary",
    mistake: "step-error",
    custom: "step-info",
  };

  return (
    <div className="mb-4 hidden text-center lg:mb-0 lg:ml-14 lg:mr-4 lg:block lg:self-start">
      <div className="px-5 text-center 2xl:w-full">
        <div className="flex justify-center">
          <div className="tabs-boxed tabs w-[32rem] justify-around rounded-b-none">
            {["setup", "mistake", "custom"].map((tab) => (
              <p
                key={tab}
                className={`tab  text-xs uppercase ${
                  tagType === tab ? "tab-active" : ""
                }`}
                onClick={() => setTagType(tab)}
              >
                {tab}
              </p>
            ))}
          </div>
        </div>

        {isSuccess ? (
          <ul
            className={`steps steps-vertical h-96 w-[32rem] overflow-scroll rounded-b-3xl bg-base-200 pl-5 pt-1 ${
              sortedTags.length === 1 ? "items-start pt-5" : ""
            }`}
          >
            {sortedTags.map((tag) => (
              <li key={tag.tagId} className={`step ${tagColors[tagType]}`}>
                {tag.name} x {tag.count}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-96  w-[32rem] items-center justify-center rounded-b-3xl bg-base-200 pl-5 pt-1">
            <span className="loading loading-dots loading-md text-primary"></span>
          </div>
        )}
      </div>
    </div>
  );
};
