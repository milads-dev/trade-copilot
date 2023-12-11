import React from "react";
import { type OptionProps, components } from "react-select";

import { api } from "~/utils/api";

export const DeleteTagIcon = (
  props: OptionProps<{ value: string; label: string; id: number }>
) => {
  const deleteTag = api.tags.deleteTag.useMutation();
  const ctx = api.useContext();

  return (
    <div className="flex">
      <components.Option {...props}>{props.children}</components.Option>
      <span
        className="flex w-12 cursor-pointer items-center justify-center hover:bg-red-400 active:bg-red-500"
        onClick={() =>
          deleteTag.mutate(props.data.id, {
            onSuccess: () => void ctx.tags.invalidate(),
            onError: () => alert("Error: Tag is used on another trade"),
          })
        }
      >
        <svg
          width="25"
          height="25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 7a1 1 0 0 1 1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 1 1 2 0v11a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a1 1 0 0 1 1-1z"
            fill="#e11616"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 8a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1zM14 8a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1zM4 5a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1zM8 3a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1z"
            fill="#e11616"
          />
        </svg>
      </span>
    </div>
  );
};
