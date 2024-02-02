import { differenceInDays, endOfMonth, startOfMonth } from "date-fns";
import moment from "moment";

import { WEEK_EXCLUDING_TODAY } from "../constants";

export const calculateCalendarRange = (currentDate: Date) => {
  const calendarStart = startOfMonth(currentDate);
  const calendarEnd = endOfMonth(currentDate);
  const numDays = differenceInDays(calendarEnd, calendarStart) + 1;
  const prefixDays = calendarStart.getDay();

  const suffixDays = WEEK_EXCLUDING_TODAY - calendarEnd.getDay();
  return {
    calendarStart,
    calendarEnd,
    numDays,
    prefixDays,
    suffixDays,
  };
};

export const formatDate = (date: Date) => moment(date).format("MM/DD/YYYY");
