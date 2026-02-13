import { useRouter } from "next/router";

import { TradeFilterSelect } from "~/features/tradeHistory";
import { api } from "~/utils/api";

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));
const mockUseRouter = useRouter as jest.Mock;
jest.mock("~/utils/api", () => ({
  api: {
    tags: {
      getTagsByFilter: {
        useQuery: jest.fn(() => ({ tags: [] })),
      },
    },
  },
}));

describe("TradeFilterSelect", () => {
  test("if no tags are returned,the combobox should not be rendered", () => {
    mockUseRouter.mockReturnValue({
      pathname: "/trades",
      query: {},
      replace: jest.fn(),
    });
    render(<TradeFilterSelect />);

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  test("combobox should be rendered when tags are returned", () => {
    mockUseRouter.mockReturnValue({
      pathname: "/trades",
      query: {},
      replace: jest.fn(),
    });

    (api.tags.getTagsByFilter.useQuery as jest.Mock).mockReturnValue({
      data: {
        tags: [
          { id: 1, name: "Wrong Lq Target", type: "mistake" },
          { id: 2, name: "Correct Lq Target", type: "correct" },
        ],
      },
    });

    render(<TradeFilterSelect />);

    expect(screen.queryByRole("combobox")).toBeInTheDocument();
  });
});
