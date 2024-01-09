import moment from "moment";

export const generateTradeDetailsUrl = (
  currentUrl: string,
  symbol?: string,
  date?: string | Date
): string | null => {
  if (symbol && date) {
    const formatDate = moment(date).format("YYYY-MM-DD");
    const newUrl = `${currentUrl}/${symbol}?date=${formatDate}`;
    return newUrl;
  } else {
    return null;
  }
};
