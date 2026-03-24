import { handleOnDrop } from "~/features/tradeHistory/utils";

describe("csv handle file upload", () => {
  it("should handle file upload and parse CSV data correctly", () => {
    const setTradeData = jest.fn();
    const validData = [
      {
        ContractName: "MNQZ5",
        EnteredAt: "10/27/2025 09:34:24",
        ExitedAt: "10/27/2025 09:44:18",
        Type: "Short",
        EntryPrice: 25835.73,
        ExitPrice: 25832.25,
        PnL: 39.4,
        Size: 30,
      },
      {
        ContractName: "MNQZ5",
        EnteredAt: "10/27/2025 09:45:33",
        ExitedAt: "10/27/2025 09:48:06",
        Type: "Short",
        EntryPrice: 25834.81,
        ExitPrice: 25845.75,
        PnL: -452.3,
        Size: 40,
      },
    ];

    handleOnDrop(
      { data: validData, error: null, meta: null },
      "topStep",
      setTradeData
    );

    expect(setTradeData).toHaveBeenCalledTimes(1);
  });
  it("should not call setTradeData for invalid CSV data", () => {
    window.alert = jest.fn();
    const setTradeData = jest.fn();
    const invalidData = [
      {
        Contract: "MNQZ5",
        EnteredAt: "10/27/2025 09:34:24",
        ExitedAt: "10/27/2025 09:44:18",
        Type: "Shorttt",
        Entry: "invalid_number",
        ExitPrice: 25832.25,
        PnL: 39.4,
        Size: 30,
      },
    ];

    handleOnDrop(
      { data: invalidData, error: null, meta: {} },
      "topStep",
      setTradeData
    );
    expect(window.alert).toHaveBeenCalledWith("Wrong Trade Format");
    expect(setTradeData).not.toHaveBeenCalled();
  });
});
