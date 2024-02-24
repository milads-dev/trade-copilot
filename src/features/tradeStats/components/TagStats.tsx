import { useRouter } from "next/router";

import { useAppStore } from "~/hooks/useAppStore";
import { api } from "~/utils/api";

import { getTagClassName } from "../utils/helper";

export const TagStats = () => {
  const selectedTagType = useAppStore((state) => state.selectedTagType);
  const updateTagType = useAppStore((state) => state.updateTagType);
  const updateTagId = useAppStore((state) => state.updateTagId);

  const router = useRouter();
  const startDate = router.query.from as string;
  const endDate = router.query.to as string;

  const { data, isSuccess } = api.tags.getStats.useQuery(
    { startDate, endDate },
    {
      refetchOnWindowFocus: false,
    }
  );

  const tags = data?.tags;

  const sortedTags = tags
    ? [...tags]
        .filter((tag) => {
          if (selectedTagType === "all") return tag;
          return tag.type === selectedTagType;
        })
        .sort((a, b) => {
          if (b.count !== a.count) {
            return b.count - a.count;
          }
          return a.name.localeCompare(b.name);
        })
    : [];

  const handleTagFilterNavigation = async (id: number) => {
    const currentQuery = router.query;

    const isQueryEmpty = Object.keys(currentQuery).length === 0;

    const newQuery = isQueryEmpty
      ? `filter=${id}`
      : `${router.asPath.slice(2)}&filter=${id}`;

    await router.push({
      pathname: "/trades",
      query: newQuery,
    });
  };

  const tagColors: Record<string, string> = {
    setup: "step-primary",
    mistake: "step-error",
    custom: "step-info",
  };

  return (
    <div className="mb-4  text-center lg:mb-0 lg:ml-14 lg:mr-4 lg:block lg:self-start">
      <div className="px-5 text-center 2xl:w-full">
        <div className="flex justify-center">
          <div className="tabs tabs-boxed w-[24rem] justify-around rounded-b-none min-[1920px]:w-[36rem]">
            {["setup", "mistake", "custom", "all"].map((tab) => (
              <p
                key={tab}
                className={`tab  text-xs uppercase ${
                  selectedTagType === tab ? "tab-active" : ""
                }`}
                onClick={() => updateTagType(tab)}
              >
                {tab}
              </p>
            ))}
          </div>
        </div>

        {isSuccess ? (
          <ul
            className={`steps steps-vertical h-96 w-[24rem] overflow-scroll rounded-b-3xl bg-base-200 pl-5 pt-1 min-[1920px]:w-[36rem] ${
              sortedTags.length === 1 ? "items-start pt-5" : ""
            }`}
          >
            {sortedTags.map((tag) => (
              <li
                key={tag.tagId}
                className={`step ${tagColors[selectedTagType]}`}
              >
                <div
                  className={`cursor-pointer ${getTagClassName(
                    selectedTagType,
                    tag.type
                  )}`}
                  onMouseEnter={() => updateTagId(tag.tagId)}
                  onMouseLeave={() => updateTagId(null)}
                  onClick={() => void handleTagFilterNavigation(tag.tagId)}
                >
                  {tag.name} x {tag.count}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-96  w-[24rem] items-center  justify-center rounded-b-3xl bg-base-200 pl-5 pt-1 min-[1920px]:w-[36rem]">
            <span className="loading loading-infinity loading-lg text-primary"></span>
          </div>
        )}
      </div>
    </div>
  );
};
