import React from "react";

import { useRouter } from "next/router";

import { api } from "~/utils/api";

export const TradeFilterSelect = () => {
  const router = useRouter();

  const filterTag = router.query.filter as string;
  const { data } = api.tags.getTagsByFilter.useQuery(filterTag, {});

  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const filterId = event.target.value;
    const isQueryEmpty = Object.keys(router.query).length === 0;

    const newQuery = isQueryEmpty
      ? `${router.asPath}?filter=${filterId}`
      : `${router.asPath}&filter=14`;

    void router.replace(newQuery, undefined, { shallow: true });
  };

  const renderOptionsByType = (type: string) => {
    return data?.tags
      .filter((tag) => tag.type === type)
      .map((tag) => (
        <option value={tag.id} key={tag.id}>
          {tag.name}
        </option>
      ));
  };

  return (
    <div>
      {data?.tags && data?.tags?.length > 0 && (
        <select className="select" value="" onChange={handleOptionChange}>
          <option value="" disabled>
            Filter By
          </option>
          <optgroup label="Setup">{renderOptionsByType("setup")}</optgroup>
          <optgroup label="Mistake">{renderOptionsByType("mistake")}</optgroup>
          <optgroup label="Custom">{renderOptionsByType("custom")}</optgroup>
        </select>
      )}
    </div>
  );
};
