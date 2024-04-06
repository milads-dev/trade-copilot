import React, { useRef } from "react";

import { type LineType } from "../types";

interface Props {
  priceLine: LineType;
  handleInputChange: (
    inputName: keyof LineType,
    value: string | number
  ) => void;
  handleSubmit: () => void;
}

export const PriceLineHeader = ({
  priceLine,
  handleInputChange,
  handleSubmit,
}: Props) => {
  const dropdownRef = useRef<HTMLDetailsElement | null>(null);

  const handleItemClick = (lineColor: string) => {
    handleInputChange("color", lineColor);
    if (dropdownRef.current) dropdownRef.current.removeAttribute("open");
  };

  return (
    <div>
      <div className="mt-8 flex w-full items-center space-x-5">
        <input
          type="text"
          value={priceLine.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="Title (optional)"
          maxLength={8}
          className="input input-bordered w-full max-w-[15rem] rounded-2xl"
        />

        <input
          type="number"
          placeholder="Price"
          value={priceLine.price ?? ""}
          onChange={(e) => handleInputChange("price", e.target.value)}
          className="input input-bordered w-full max-w-[15rem] rounded-2xl"
        />
        <div className="divider divider-horizontal"></div>
        <div className="flex flex-col items-center">
          <details
            className="dropdown dropdown-right dropdown-hover absolute top-[5.5rem]"
            ref={dropdownRef}
          >
            <summary
              tabIndex={0}
              role="button"
              className="btn btn-circle btn-ghost btn-sm"
            >
              <svg
                className=" h-5 w-5 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m10.8 17.8-6.4 2.1 2.1-6.4m4.3 4.3L19 9a3 3 0 0 0-4-4l-8.4 8.6m4.3 4.3-4.3-4.3m2.1 2.1L15 9.1m-2.1-2 4.2 4.2"
                />
              </svg>
            </summary>
            <ul
              tabIndex={0}
              className="menu dropdown-content rounded-box z-[1] w-14 space-y-3 bg-base-100 p-2"
            >
              <li>
                <div
                  onClick={() => handleItemClick("#2AA69A")}
                  className="h-8 w-8 rounded-lg bg-[#2AA69A]"
                />
              </li>
              <li>
                <div
                  onClick={() => handleItemClick("#EF5350")}
                  className="h-8 w-8 rounded-lg bg-[#EF5350]"
                />
              </li>
              <li>
                <div
                  onClick={() => handleItemClick("#2863ff")}
                  className="h-8 w-8 rounded-lg bg-[#2863ff]"
                />
              </li>
            </ul>
          </details>

          <input
            type="color"
            id="colorPicker"
            name="colorPicker"
            className="h-8 w-8"
            onChange={(event) => handleInputChange("color", event.target.value)}
            value={priceLine.color}
          ></input>
        </div>

        <select
          value={priceLine.style}
          onChange={(e) => handleInputChange("style", e.target.value)}
          className="select select-bordered w-full max-w-[10rem] rounded-2xl"
        >
          <option value={0}>Solid Line</option>
          <option value={3}>Dashed Line</option>
          <option value={4}>Dotted Line</option>
        </select>
        <select
          onChange={(e) => handleInputChange("size", e.target.value)}
          value={priceLine.size}
          className="select select-bordered w-full max-w-[10rem] rounded-2xl"
        >
          <option value={1}>sm</option>
          <option value={2}>md</option>
          <option value={3}>lg</option>
          <option value={4}>xl</option>
        </select>
      </div>
      <div
        className={`btn btn-ghost btn-block my-7 ${
          priceLine.id === undefined && priceLine.price.length !== 0
            ? ""
            : "btn-disabled"
        }`}
        onClick={handleSubmit}
      >
        Add Price to Chart
      </div>
    </div>
  );
};
