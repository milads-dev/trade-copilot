import React from "react";

import { useRouter } from "next/router";

import { EyeClosedIcon, EyeOpenIcon } from "~/components/icons";
import { useAppStore } from "~/hooks/useAppStore";
import { api } from "~/utils/api";

import { type LineType } from "../types";

interface Props {
  priceLine: LineType;
  handleCheckboxChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    row: LineType
  ) => void;
  handlePriceLineDelete: (id: number) => void;
}

export const PriceLineTable = ({
  priceLine,
  handleCheckboxChange,
  handlePriceLineDelete,
}: Props) => {
  const router = useRouter();
  const symbol = router.query.symbol as string;
  const date = router.query.date as string;

  const updateHiddenPriceLine = useAppStore(
    (state) => state.updateHiddenPriceLine
  );
  const hiddenPriceLineIds = useAppStore((state) => state.hiddenPriceLineIds);

  const { data } = api.tradeDetails.getPriceLines.useQuery(
    {
      symbol,
      date,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const LINE_STYLES: Record<string, string> = {
    0: "Solid Line",
    3: "Dashed Line",
    4: "Dotted Line",
  };
  const LINE_SIZES: Record<string, string> = {
    1: "1px",
    2: "2px",
    3: "3px",
    4: "4px",
  };
  return (
    <div className="h-64 overflow-x-auto">
      <table className="table table-zebra table-pin-rows">
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Price</th>
            <th>Line Style</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data?.priceLines.map((row) => (
            <tr key={row.id}>
              <th>
                <label>
                  <input
                    type="checkbox"
                    className="checkbox-info checkbox"
                    checked={row.id === priceLine.id}
                    onChange={(event) => handleCheckboxChange(event, row)}
                  />
                </label>
              </th>
              <td>
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-bold">{row.title}</div>
                  </div>
                </div>
              </td>
              <td>{row.price}</td>
              <td className="">
                <span className="badge badge-ghost badge-sm">
                  {`Color: ${row.color} ${LINE_STYLES[row.style]} ${
                    LINE_SIZES[row.size]
                  }`}
                </span>
              </td>
              <th>
                <label className="swap">
                  <input
                    type="checkbox"
                    checked={hiddenPriceLineIds.includes(row.id)}
                    onChange={() => updateHiddenPriceLine(row.id)}
                  />
                  <EyeOpenIcon />
                  <EyeClosedIcon />
                </label>
              </th>

              <th>
                <button
                  onClick={() => handlePriceLineDelete(row.id)}
                  className="btn btn-ghost btn-xs hover:btn-error"
                >
                  delete
                </button>
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
