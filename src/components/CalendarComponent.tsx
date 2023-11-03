import React from "react";
import Calendar from "react-calendar";

import { type DateRangeType } from "~/features/tradeHistory";

interface Props {
  dateRange: DateRangeType;
  onDateChange: (dates: unknown) => void;
}

export const CalendarComponent = ({ dateRange, onDateChange }: Props) => {
  return (
    <div className="absolute right-0 top-12 z-50 ">
      <Calendar onChange={onDateChange} value={dateRange} selectRange />
    </div>
  );
};
