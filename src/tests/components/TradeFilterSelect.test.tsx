import { useRouter } from "next/router";

import { TradeFilterSelect } from "~/features/tradeHistory";
import { api } from "~/utils/api";

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

jest.mock("~/utils/api");
describe("TradeFilterSelect", () => {
  test("if no tags are returned,the combobox should not be rendered", () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: "/trades",
      query: {},
      replace: jest.fn(),
    });
    render(<TradeFilterSelect />);

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  test("combobox should be rendered when tags are returned", () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: "/trades",
      query: {},
      replace: jest.fn(),
    });

    (api.tags.getTagsByFilter.useQuery as jest.Mock).mockReturnValue({
      data: {
        tags: [
          { id: 1, name: "Wrong Lq Target", type: "mistake" },
          { id: 2, name: "Correct Lq Target", type: "setup" },
        ],
      },
    });

    render(<TradeFilterSelect />);

    expect(screen.queryByRole("combobox")).toBeInTheDocument();
  });
});
