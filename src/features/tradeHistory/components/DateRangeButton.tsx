import React, { useState } from "react";
import "react-calendar/dist/Calendar.css";

import { useRouter } from "next/router";

import { CalendarComponent } from "~/components/CalendarComponent";

import { DateRangeSchema, type DateRangeType } from "../types";

interface Props {
  passDateChange: (dates: unknown) => void;
}

export const DateRangeButton = ({ passDateChange }: Props) => {
  const router = useRouter();
  const startDate = router.query.from as string | undefined;
  const endDate = router.query.to as string | undefined;
  const initialStartDate = startDate ? new Date(startDate) : null;
  const initialEndDate = endDate ? new Date(endDate) : null;

  const [dateRange, setDateRange] = useState<DateRangeType>([
    initialStartDate,
    initialEndDate,
  ]);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const handleDateChange = (dates: unknown) => {
    setDateRange(DateRangeSchema.parse(dates));
    setCalendarVisible(false);
    passDateChange(dates);
  };

  const toggleCalendar = () => {
    setCalendarVisible(!calendarVisible);
  };
  return (
    <>
      <button className="btn">
        {dateRange[0] && dateRange[1] ? (
          <>
            <span
              className="flex items-center"
              onClick={() => toggleCalendar()}
            >
              {new Date(dateRange[0]).toLocaleDateString()} -{" "}
              {new Date(dateRange[1]).toLocaleDateString()}
            </span>
            <svg
              onClick={() => handleDateChange([null, null])}
              className="ml-3 h-3 w-3 text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </>
        ) : (
          <div className="flex items-center" onClick={() => toggleCalendar()}>
            Select Date
            <svg
              className="ml-3 h-4 w-4 text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                fill="currentColor"
                d="M6 1a1 1 0 0 0-2 0h2ZM4 4a1 1 0 0 0 2 0H4Zm7-3a1 1 0 1 0-2 0h2ZM9 4a1 1 0 1 0 2 0H9Zm7-3a1 1 0 1 0-2 0h2Zm-2 3a1 1 0 1 0 2 0h-2ZM1 6a1 1 0 0 0 0 2V6Zm18 2a1 1 0 1 0 0-2v2ZM5 11v-1H4v1h1Zm0 .01H4v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM10 11v-1H9v1h1Zm0 .01H9v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM10 15v-1H9v1h1Zm0 .01H9v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM15 15v-1h-1v1h1Zm0 .01h-1v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM15 11v-1h-1v1h1Zm0 .01h-1v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM5 15v-1H4v1h1Zm0 .01H4v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM2 4h16V2H2v2Zm16 0h2a2 2 0 0 0-2-2v2Zm0 0v14h2V4h-2Zm0 14v2a2 2 0 0 0 2-2h-2Zm0 0H2v2h16v-2ZM2 18H0a2 2 0 0 0 2 2v-2Zm0 0V4H0v14h2ZM2 4V2a2 2 0 0 0-2 2h2Zm2-3v3h2V1H4Zm5 0v3h2V1H9Zm5 0v3h2V1h-2ZM1 8h18V6H1v2Zm3 3v.01h2V11H4Zm1 1.01h.01v-2H5v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H5v2h.01v-2ZM9 11v.01h2V11H9Zm1 1.01h.01v-2H10v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H10v2h.01v-2ZM9 15v.01h2V15H9Zm1 1.01h.01v-2H10v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H10v2h.01v-2ZM14 15v.01h2V15h-2Zm1 1.01h.01v-2H15v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H15v2h.01v-2ZM14 11v.01h2V11h-2Zm1 1.01h.01v-2H15v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H15v2h.01v-2ZM4 15v.01h2V15H4Zm1 1.01h.01v-2H5v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H5v2h.01v-2Z"
              />
            </svg>
          </div>
        )}
      </button>
      {calendarVisible && (
        <CalendarComponent
          dateRange={dateRange}
          onDateChange={handleDateChange}
        />
      )}
    </>
  );
};
