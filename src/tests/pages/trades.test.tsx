import { TradeHistoryPage } from "~/features/tradeHistory";
import { api } from "~/utils/api";

import { render, screen } from "@testing-library/react";

jest.mock("~/utils/api");

(api.trades.getTrades.useInfiniteQuery as jest.Mock).mockReturnValue({
  data: {
    pages: [{}],
  },
});

beforeEach(() => {
  jest.clearAllMocks();
});
describe("TradeHistoryPage", () => {
  test("initial empty state", () => {
    render(<TradeHistoryPage />);
    expect(screen.getByText(/no trades found/i)).toBeInTheDocument();
  });
  test("trade table shows loader", () => {
    (api.trades.getTrades.useInfiniteQuery as jest.Mock).mockReturnValue({
      isLoading: true,
    });
    render(<TradeHistoryPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  test("renders trades when data exists", () => {
    (api.tags.getTagsByFilter.useQuery as jest.Mock).mockReturnValue({
      data: {
        tags: [
          { id: 3, name: "Custom Tag", type: "custom" },
          { id: 1, name: "Wrong Lq Target", type: "setup" },
          { id: 2, name: "Correct Lq Target", type: "mistake" },
        ],
      },
    });
    (api.trades.getTrades.useInfiniteQuery as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            trades: [
              {
                id: "1",
                Symbol: "MNQH6",
                Profit: -896,
                openTimeStamp: "2025-12-23 09:30:19",
                closeTimeStamp: "2025-12-23 16:04:19",
              },
              {
                id: "2",
                Symbol: "ESZ5",
                Profit: 1200,
                openTimeStamp: "2025-12-10 09:30:19",
                closeTimeStamp: "2025-12-10 16:04:19",
              },
            ],
          },
        ],
      },
    });
    render(<TradeHistoryPage />);

    expect(screen.getByText("MNQH6")).toBeInTheDocument();
    expect(screen.getByText("ESZ5")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).toBeInTheDocument();
  });
});
