import { generateDateRangeUrl } from "../../../features/tradeHistory/utils/helper";

describe("generateDateRangeUrl", () => {
  it("includes start, end, and filter when all are provided", () => {
    const start = new Date(2026, 0, 1); // year, monthIndex(0=Jan), day
    const end = new Date(2026, 0, 31);

    const url = generateDateRangeUrl("/trades", start, end, "equities");
    expect(url).toBe(
      "/trades?from=01%2F01%2F2026&to=01%2F31%2F2026&filter=equities"
    );
  });

  it("omits filter if null", () => {
    const start = new Date(2026, 0, 1); // year, monthIndex(0=Jan), day
    const end = new Date(2026, 0, 31);

    const url = generateDateRangeUrl("/trades", start, end);
    expect(url).toBe("/trades?from=01%2F01%2F2026&to=01%2F31%2F2026");
  });

  it("returns base URL if dates are missing", () => {
    const url = generateDateRangeUrl("/trades", null, null, null);
    expect(url).toBe("/trades");
  });
});
