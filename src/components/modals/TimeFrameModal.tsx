import React from "react";

interface Props {
  timeFrame: number;
  setTimeFrame: React.Dispatch<React.SetStateAction<number>>;
}
export const TimeFrameModal = ({ timeFrame, setTimeFrame }: Props) => {
  return (
    <dialog id="timeframe_modal" className="modal">
      <div className="modal-box absolute   right-[30%] h-56 max-w-[35%] bg-base-200 lg:right-[25%] lg:max-w-[15%]">
        <div className="flex h-full flex-col items-center justify-between">
          <h3 className="text-lg font-bold">Change TimeFrame</h3>
          <div className="flex w-full flex-col items-stretch px-8">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">1 Min</span>
                <input
                  type="radio"
                  name="radio-10"
                  className="radio checked:bg-success focus-visible:outline-none"
                  value={1}
                  checked={timeFrame === 1}
                  onChange={(e) => setTimeFrame(parseInt(e.target.value))}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">5 Min</span>
                <input
                  type="radio"
                  name="radio-10"
                  className="radio checked:bg-info focus-visible:outline-none"
                  value={5}
                  checked={timeFrame === 5}
                  onChange={(e) => setTimeFrame(parseInt(e.target.value))}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">15 Min</span>
                <input
                  type="radio"
                  name="radio-10"
                  className="radio checked:bg-error focus-visible:outline-none"
                  value={15}
                  checked={timeFrame === 15}
                  onChange={(e) => setTimeFrame(parseInt(e.target.value))}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};
