import moment from "moment";
import { ZodError } from "zod";

import { formatUtcTimestamp, transformCsvData } from "../format";

describe("Trade Formatting Utils", () => {
  const mockTrades = [
    {
      ContractName: "MNQZ5",
      Type: "Long",
      EnteredAt: "10/21/2025 09:36:11",
      ExitedAt: "10/21/2025 09:41:28",
      Size: 5,
      EntryPrice: 25264.75,
      ExitPrice: 25287.38,
      PnL: -240.2,
    },
    {
      ContractName: "MNQZ5",
      Type: "Short",
      EnteredAt: "10/21/2025 09:41:30",
      ExitedAt: "10/21/2025 09:44:17",
      Size: 10,
      EntryPrice: 25263.88,
      ExitPrice: 25253.12,
      PnL: 207.6,
    },
    {
      ContractName: "MNQZ5",
      Type: "Long",
      EnteredAt: "10/21/2025 09:44:54",
      ExitedAt: "10/21/2025 09:45:47",
      Size: 3,
      EntryPrice: 25235,
      ExitPrice: 25260,
      PnL: -152.22,
    },
  ];
  it("combines entries and exits correctly", () => {
    const result = transformCsvData(mockTrades, "topStep");
    if (result) {
      expect(result[0]!.Symbol).toContain("MNQ");
    }
  });
  it("throws error on wrong schema selection with valid data", () => {
    expect(() => transformCsvData(mockTrades, "metaTrader")).toThrow(ZodError);
  });

  it("formats string timestamps correctly", () => {
    const input = "2025-10-21T13:45:00Z";
    const result = formatUtcTimestamp(input);

    const expected = moment.utc(input).format("MM/DD/YYYY h:mm:ss");
    expect(result).toBe(expected);
  });
  it("formats Date objects correctly", () => {
    const date = new Date("2025-10-21T13:45:00Z");
    const result = formatUtcTimestamp(date);

    const expected = moment.utc(date).format("YYYY-MM-DD HH:mm:ss");
    expect(result).toBe(expected);
  });

  it("throws an error for invalid types", () => {
    // @ts-expect-error – we intentionally pass a bad type
    expect(() => formatUtcTimestamp(12345)).toThrow("Invalid timestamp type");
  });
});
