import React, { useState } from "react";

import { useRouter } from "next/router";

import { api } from "~/utils/api";

import { type LineType } from "../types";
import { PriceLineHeader } from "./PriceLineHeader";
import { PriceLineTable } from "./PriceLineTable";

export const PriceLineModal = () => {
  const [priceLine, setPriceLine] = useState<LineType>({
    title: "",
    price: "",
    color: "#2AA69A",
    style: "0",
    size: "2",
  });

  const router = useRouter();
  const symbol = router.query.symbol as string;
  const date = router.query.date as string;

  const handleInputChange = (
    inputName: keyof LineType,
    value: string | number
  ) => {
    setPriceLine((prevValues) => ({
      ...prevValues,
      [inputName]: value,
    }));
  };
  const ctx = api.useContext();

  const resetPriceLine = () =>
    setPriceLine({
      title: "",
      price: "",
      color: "#2AA69A",
      style: "0",
      size: "2",
    });

  const addPriceLine = api.tradeDetails.addPriceLine.useMutation({
    onSuccess() {
      void ctx.tradeDetails.getPriceLines.invalidate({ symbol, date });
      resetPriceLine();
    },
    onError(error) {
      alert(error.message);
    },
  });

  const deletePriceLine = api.tradeDetails.deletePriceLines.useMutation({
    onSuccess() {
      void ctx.tradeDetails.getPriceLines.invalidate({ symbol, date });
      resetPriceLine();
    },
  });

  const handleSubmit = () => {
    addPriceLine.mutate({
      symbol,
      date,
      priceLine,
    });
  };

  const handlePriceLineDelete = (id: number) => deletePriceLine.mutate(id);
  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    row: LineType
  ) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      setPriceLine({
        ...row,
      });
    } else {
      resetPriceLine();
    }
  };

  return (
    <dialog id="price_line_modal" className="modal">
      <div className="modal-box h-2/3 max-w-[50%]">
        <div className="flex h-full flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold">Add/Modify Price Lines</h3>
            <div className="divider"></div>
            <PriceLineHeader
              priceLine={priceLine}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
            />
          </div>
          <PriceLineTable
            priceLine={priceLine}
            handleCheckboxChange={handleCheckboxChange}
            handlePriceLineDelete={handlePriceLineDelete}
          />

          <div className="flex justify-between">
            <span>
              Press <kbd className="kbd kbd-md">Esc</kbd> or click outside to
              close
            </span>

            <button
              onClick={() => handleSubmit()}
              className={`btn btn-success btn-outline w-24 ${
                priceLine.id === undefined ? "btn-disabled" : ""
              }`}
            >
              Update
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};
