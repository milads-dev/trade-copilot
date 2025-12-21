import React from "react";

import { useAppStore } from "~/hooks/useAppStore";
import { type RouterOutputs } from "~/utils/api";

type Tags = RouterOutputs["tags"]["getTagsByDateRange"]["tags"];

export const TagGroupAvatar = ({ tradeTags }: { tradeTags: Tags }) => {
  const selectedTagType = useAppStore((state) => state.selectedTagType);
  const selectedTagId = useAppStore((state) => state.selectedTagId);
  const isTagIdSelected = tradeTags?.some((tag) => tag.id === selectedTagId);

  const tradeTagColor =
    selectedTagType === "mistake"
      ? "bg-error"
      : selectedTagType === "custom"
      ? "bg-info"
      : selectedTagType === "setup"
      ? "bg-success"
      : "bg-warning";

  const visibleTags = tradeTags?.slice(0, 3);

  if (!visibleTags || visibleTags.length === 0) return null;

  return (
    <div
      className={`tooltip tooltip-bottom absolute mt-16 hidden before:whitespace-pre-line before:text-left lg:block ${
        isTagIdSelected && "animate-bounce"
      } `}
      data-tip={tradeTags
        ?.map((tag, index) => `${index + 1}.${tag.name}`)
        .join("\n")}
    >
      <div className="avatar-group w-16 -space-x-6">
        {visibleTags.map((_, index) => (
          <div key={index} className={`avatar ${tradeTagColor}`}>
            <div className="w-12"></div>
          </div>
        ))}
        <div className="avatar placeholder">
          <div className="w-12 bg-base-100">
            <span>{tradeTags?.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
