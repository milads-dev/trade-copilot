import { useRouter } from "next/router";

import { TradeHistoryMenu } from "~/features/tradeHistory";
import { api } from "~/utils/api";

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("~/utils/api.ts");

jest.mock("~/components/DateRangeCalendar.tsx", () => ({
  DateRangeCalendar: ({
    onDateChange,
  }: {
    onDateChange: (dates: unknown) => void;
  }) => (
    <button
      data-testid="mock-calendar-trigger"
      onClick={() =>
        onDateChange([new Date("2026/02/09"), new Date("2026/02/13")])
      }
    >
      Select Dates
    </button>
  ),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();

const setupRouter = (query = {}) => {
  (useRouter as jest.Mock).mockReturnValue({
    pathname: "/trades",
    query,
    push: mockPush,
    replace: mockReplace,
  });
};
describe("TradeHistoryMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders the component in its default state", () => {
    render(<TradeHistoryMenu />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText("Select Date")).toBeInTheDocument();
  });
  it("updates state when user selects a date", async () => {
    const user = userEvent.setup();

    render(<TradeHistoryMenu />);

    await user.click(screen.getByText(/select date/i));

    await user.click(screen.getByTestId("mock-calendar-trigger"));

    expect(screen.getByText("2/9/2026 - 2/13/2026")).toBeInTheDocument();

    expect(
      screen.queryByTestId("mock-calendar-trigger")
    ).not.toBeInTheDocument();
  });

  it("renders the menu with tag filters", () => {
    (api.tags.getTagsByFilter.useQuery as jest.Mock).mockReturnValue({
      data: {
        tags: [
          { id: 1, name: "Wrong Lq Target", type: "mistake" },
          { id: 2, name: "Correct Lq Target", type: "setup" },
        ],
      },
    });
    render(<TradeHistoryMenu />);

    const filterSelect = screen.getByRole("combobox", {
      name: /filter by/i,
    });

    expect(filterSelect).toBeInTheDocument();
  });

  it("renders the menu with a selected date range and allows user to clear it", async () => {
    setupRouter({ from: "02/09/2026", to: "02/13/2026", filter: 55 });
    render(<TradeHistoryMenu />);

    expect(screen.getByText("2/9/2026 - 2/13/2026")).toBeInTheDocument();

    const clearIcon = screen.getByLabelText("Clear date filter");
    await userEvent.click(clearIcon);

    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it("renders the menu with a selected filter and allows user to clear it", async () => {
    setupRouter({ filter: 78 });
    const user = userEvent.setup();

    render(<TradeHistoryMenu />);
    const removeFilterButton = screen.getByTestId("remove-tag-button");
    await user.click(removeFilterButton);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/trades",
      query: {},
    });
  });
});
