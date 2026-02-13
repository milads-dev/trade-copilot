// import {
//   getValidCsvData,
//   isMetaTraderCsv,
// } from "features/tradeHistory/utils/validation";
import { getValidCsvData, isMetaTraderCsv } from "~/features/tradeHistory";

describe("CSV Validation Utilities", () => {
  const mockData = [
    // Valid MetaTrader row
    {
      Symbol: "EURUSD",
      Time: "2025-01-01",
      Type: "Long",
      Price: 1.1,
      Profit: 10,
      Volume: 1,
    },
    // Invalid row
    {
      Symbol: null,
      Time: "2025-01-01",
      Price: "1.10",
      Profit: "10",
      Volume: "1",
    },
    // Valid TopStep row
    {
      ContractName: "MNQZ5",
      Type: "Short",
      EnteredAt: "10/21/2025 13:16:12",
      ExitedAt: "10/21/2025 13:24:36",
      Size: 3,
      EntryPrice: 25296.75,
      ExitPrice: 25286.75,
      PnL: 57.78,
    },
    // Another Valid TopStep row
    {
      ContractName: "MNQZ5",
      Type: "Short",
      EnteredAt: "10/21/2025 13:18:12",
      ExitedAt: "10/21/2025 13:29:36",
      Size: 3,
      EntryPrice: 25296.75,
      ExitPrice: 25286.75,
      PnL: 57.78,
    },
  ];
  it("returns valid row for metaTrader", () => {
    const valid = getValidCsvData(mockData, "metaTrader");
    expect(valid?.length).toBe(1);
    expect(valid?.[0]).toEqual(mockData[0]);
  });
  it("returns valid row for topStep", () => {
    const valid = getValidCsvData(mockData, "topStep");
    expect(valid?.length).toBe(2);
    expect(valid).toContainEqual(mockData[2]);
    expect(valid).toContainEqual(mockData[3]);
  });

  it("correctly identifies MetaTrader CSV arrays", () => {
    expect(isMetaTraderCsv([mockData[0]])).toBe(true);
  });
});
