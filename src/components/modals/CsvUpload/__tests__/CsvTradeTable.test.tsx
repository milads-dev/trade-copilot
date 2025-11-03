import { render, screen } from "@testing-library/react";

import { type TradeDetails } from "../../types";
import CsvTradeTable from "../CsvTradeTable";

const mockTrades: TradeDetails[] = [
  {
    Symbol: "MNQZ5",
    TimeStamp: "2025-10-21T09:36:11.000Z",
    Volume: 5,
    Price: 25264.75,
    Profit: 120,
  },
];

jest.mock("../CsvFileUpload.tsx", () => ({
  CsvFileUpload: () => <div data-testid="mock-upload">Mock Upload</div>,
}));
test("renders trade rows when tradeData is provided", () => {
  render(
    <CsvTradeTable
      direction={1}
      tradeData={mockTrades}
      tradePlatform="topStep"
      setTradeData={jest.fn()}
    />
  );

  expect(screen.getByText(/MNQZ5/)).toBeInTheDocument();
  expect(screen.getByText(/120/)).toBeInTheDocument();
  expect(screen.getByTestId("mock-upload")).toBeInTheDocument();
});
