/* eslint-disable @typescript-eslint/no-unsafe-call */
// import { useCSVReader } from "react-papaparse";
import { fireEvent, render, screen } from "@testing-library/react";

import { CsvFileUpload } from "../CsvFileUpload";

jest.mock("react-papaparse", () => ({
  useCSVReader: jest.fn(() => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CSVReader: ({ onUploadAccepted, children }: any) => (
      <div
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        onClick={() => onUploadAccepted({ data: [], error: null, meta: {} })}
      >
        {children({ getRootProps: () => ({ onClick: jest.fn() }) })}
      </div>
    ),
  })),
}));

jest.mock("~/utils/api", () => ({
  api: {
    trades: {
      addTrades: {
        useMutation: jest.fn(() => ({ isLoading: false, mutate: jest.fn() })),
      },
    },
    useContext: jest.fn(() => ({ trades: { invalidate: jest.fn() } })),
  },
}));
window.alert = jest.fn();

describe("CsvFileUpload component", () => {
  it("renders upload button", () => {
    render(<CsvFileUpload tradeSchema="topStep" setTradeData={jest.fn()} />);
    expect(screen.getByText(/Import CSV/i)).toBeInTheDocument();
  });

  it("calls handleOnDrop on file upload", () => {
    const setTradeData = jest.fn();
    render(<CsvFileUpload tradeSchema="topStep" setTradeData={setTradeData} />);
    fireEvent.click(screen.getByText(/Import CSV/i));
    expect(setTradeData).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith("Wrong Trade Format");
  });
});
