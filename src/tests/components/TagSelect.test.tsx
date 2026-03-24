import { type ActionMeta, type MultiValue } from "react-select";

import { useRouter } from "next/router";

import { type TagDetail } from "~/features/tradeDetails";
import { TagSelect } from "~/features/tradeDetails/components/TagSelect";
import { api } from "~/utils/api";

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface MockProps {
  onChange: (
    _newValue: MultiValue<TagDetail>,
    actionMeta: ActionMeta<TagDetail>
  ) => void;
  value: MultiValue<TagDetail>;
}
jest.mock("~/utils/api");
jest.mock("react-select/creatable", () => {
  return function MockCreatableSelect({ onChange, value }: MockProps) {
    return (
      <div>
        <button
          data-testid="mock-remove"
          onClick={() =>
            onChange([], {
              action: "remove-value",
              removedValue: {
                id: 1,
                value: "setup1",
                label: "Setup 1",
                type: "mistake",
              },
            })
          }
        >
          Remove Tag
        </button>

        <button
          data-testid="mock-select"
          onClick={() =>
            onChange([], {
              action: "select-option",
              option: {
                id: 2,
                value: "mistake 2",
                label: "mistake 2",
                type: "mistake",
              },
            })
          }
        >
          Select Tag
        </button>

        <div data-testid="current-value">{JSON.stringify(value)}</div>
      </div>
    );
  };
});

describe("TagSelect Component", () => {
  test("Tag can be selected from options", async () => {
    const user = userEvent.setup();

    const mockSelectTagMutate = jest.fn();
    (api.tags.addTagToTrade.useMutation as jest.Mock).mockReturnValue({
      mutate: mockSelectTagMutate,
    });

    (useRouter as jest.Mock).mockReturnValue({
      query: { symbol: "MNQ", date: "01/31/2026" },
    });

    render(
      <>
        (
        <TagSelect
          tagType="Setup"
          value={[{ id: 1, label: "Setup 1", type: "setup", value: "setup1" }]}
          options={undefined}
        />
        );
      </>
    );
    //
    const selectButton = screen.getByTestId("mock-select");

    await user.click(selectButton);

    expect(mockSelectTagMutate).toHaveBeenCalledWith({
      id: 2,
      date: "01/31/2026",
      symbol: "MNQ",
    });
  });

  test("Tag can be removed from options", async () => {
    const user = userEvent.setup();

    const mockRemoveMutate = jest.fn();
    (api.tags.removeTag.useMutation as jest.Mock).mockReturnValue({
      mutate: mockRemoveMutate,
    });

    (useRouter as jest.Mock).mockReturnValue({
      query: { symbol: "dddd", date: "01/31/2026" },
    });

    render(
      <>
        (
        <TagSelect
          tagType="Setup"
          value={[{ id: 1, label: "Setup 1", type: "setup", value: "setup1" }]}
          options={undefined}
        />
        );
      </>
    );

    const removeButton = screen.getByTestId("mock-remove");

    await user.click(removeButton);

    expect(mockRemoveMutate).toHaveBeenCalledWith({
      id: 1,
    });
  });
});
