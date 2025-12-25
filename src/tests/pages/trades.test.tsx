import { TradeHistoryPage } from "~/features/tradeHistory";
import { api } from "~/utils/api";

import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("~/utils/api", () => ({
  api: {
    trades: {
      getTrades: {
        useInfiniteQuery: jest.fn(),
      },
      addTrades: {
        useMutation: jest.fn(),
      },
    },
    tags: {
      getTagsByFilter: {
        useQuery: jest.fn(),
      },
    },
    useContext: jest.fn(() => ({ trades: { invalidate: jest.fn() } })),
  },
}));

jest.mock("next/router", () => ({
  useRouter: () => ({
    query: {},
    replace: jest.fn(),
  }),
}));

jest.mock("~/components/Drawer", () => ({
  Drawer: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

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
  isLoading: false,
  fetchNextPage: jest.fn(),
});

(api.tags.getTagsByFilter.useQuery as jest.Mock).mockReturnValue({
  data: undefined,
});

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = jest.fn();
  HTMLDialogElement.prototype.close = jest.fn();
});
test("renders trades when data exists", () => {
  render(<TradeHistoryPage />);

  expect(screen.getByText("MNQH6")).toBeInTheDocument();
  expect(screen.getByText("ESZ5")).toBeInTheDocument();
});

test("initial empty state", () => {
  (api.trades.getTrades.useInfiniteQuery as jest.Mock).mockReturnValue({
    data: {
      pages: [
        {
          trades: [],
        },
      ],
    },
    isLoading: false,
    fetchNextPage: jest.fn(),
  });

  render(<TradeHistoryPage />);

  expect(screen.getByText(/no trades found/i)).toBeInTheDocument();

  fireEvent.click(screen.getByText(/import trades/i));

  expect(screen.getByText(/select your platform/i)).toBeInTheDocument();

  const nextButton = screen.getByText(/next step/i);
  expect(nextButton).toBeDisabled();
});
