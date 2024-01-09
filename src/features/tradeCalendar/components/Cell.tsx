import type { ReactNode } from "react";

import { useRouter } from "next/router";

import { generateDateRangeUrl } from "~/features/tradeHistory";

interface Props {
  isDisabled?: boolean;
  highlightColor?: string;
  date?: Date;
  children?: ReactNode;
}

export const Cell: React.FC<Props> = ({
  isDisabled,
  highlightColor,
  children,
  date,
}) => {
  const router = useRouter();

  return (
    <div
      onClick={
        date
          ? () => router.push(generateDateRangeUrl("/trades", date))
          : undefined
      }
      className={`flex h-32 select-none items-start justify-start border-b border-r p-3 text-white transition-colors  
        ${isDisabled ? "" : "cursor-pointer hover:bg-secondary-content"}
        ${highlightColor}`}
    >
      {children}
    </div>
  );
};
