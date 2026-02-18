import { useRouter } from "next/router";

import { DateRangeButton } from "~/features/tradeHistory";

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("DateRangeButton", () => {
  const passDateChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should show Select Date when no query params are present", () => {
    render(<DateRangeButton passDateChange={passDateChange} />);

    expect(screen.getByText("Select Date")).toBeInTheDocument();
  });
  test("should show selected date range when query params are present", () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: { from: "01/01/2026", to: "01/31/2026" },
    });
    render(<DateRangeButton passDateChange={passDateChange} />);

    expect(screen.getByText("1/1/2026 - 1/31/2026")).toBeInTheDocument();
  });
  test("should show select date when date filter is removed", async () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {
        from: "2024-01-01",
        to: "2024-01-31",
      },
    });

    render(<DateRangeButton passDateChange={passDateChange} />);

    await userEvent.click(screen.getByLabelText("Clear date filter"));

    expect(passDateChange).toHaveBeenCalledWith([null, null]);
    expect(screen.getByText("Select Date")).toBeInTheDocument();
  });
});
