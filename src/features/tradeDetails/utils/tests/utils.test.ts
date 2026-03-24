import { type Tag } from "../../type";
import {
  formatTradeTags,
  getMarketTimes,
  subtractMinutesFromUnixTime,
} from "../format";
import { generateTradeDetailsUrl } from "../helper";

describe("Trade Utilities", () => {
  describe("formatTradeTags", () => {
    it("should categorize tags into correct buckets", () => {
      const mockTags = [
        { id: 1, name: "Breakout", type: "setup" },
        { id: 2, name: "FOMO", type: "mistake" },
        { id: 3, name: "Note", type: "custom" },
      ];

      const result = formatTradeTags(mockTags as Tag[]);

      expect(result.setup).toHaveLength(1);
      expect(result.setup[0]!.value).toBe("Breakout");
      expect(result.mistake).toHaveLength(1);
      expect(result.custom).toHaveLength(1);
    });

    it("should return empty arrays if no tags match", () => {
      const result = formatTradeTags([]);
      expect(result).toEqual({ setup: [], mistake: [], custom: [] });
    });
  });

  describe("getMarketTimes", () => {
    it("should return correct Unix timestamps for market hours", () => {
      const { marketOpen, marketClose } = getMarketTimes("2026-03-09");

      // 9:30 AM in Unix
      expect(marketOpen).toBe(1773063000);
      // 16:00 PM in Unix
      expect(marketClose).toBe(1773086400);
    });
  });

  describe("subtractMinutesFromUnixTime", () => {
    it("should return the same time if timeframe is 1 minute", () => {
      const time = 1700000000;
      expect(subtractMinutesFromUnixTime(time, 1)).toBe(time);
    });

    it("should subtract exactly 5 minutes", () => {
      const time = 1700000000;
      const expected = time - 5 * 60;
      expect(subtractMinutesFromUnixTime(time, 5)).toBe(expected);
    });
  });
  describe("generateTradeDetailsUrl", () => {
    const baseUrl = "/trades";

    it("should return a formatted URL when symbol and date are provided", () => {
      const symbol = "AAPL";
      const date = "2026-03-13";

      const result = generateTradeDetailsUrl(baseUrl, symbol, date);

      expect(result).toBe("/trades/AAPL?date=2026-03-13");
    });

    it("should handle Date objects correctly", () => {
      const date = new Date(2026, 2, 13); // March 13, 2026
      const result = generateTradeDetailsUrl(baseUrl, "TSLA", date);

      expect(result).toBe("/trades/TSLA?date=2026-03-13");
    });

    it("should return null if symbol is missing", () => {
      const result = generateTradeDetailsUrl(baseUrl, undefined, "2026-03-13");
      expect(result).toBeNull();
    });

    it("should return null if date is missing", () => {
      const result = generateTradeDetailsUrl(baseUrl, "NVDA", undefined);
      expect(result).toBeNull();
    });
  });
});
