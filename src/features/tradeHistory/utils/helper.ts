import { type Prisma, type PrismaClient } from "@prisma/client";
import { type DefaultArgs } from "@prisma/client/runtime/library";

import moment from "moment";

type Context = {
  session: {
    user: {
      name?: string | null | undefined;
      email?: string | null | undefined;
      image?: string | null | undefined;
    } & {
      id: string;
    };
    expires: string;
  };
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
};

export const fetchTradeCount = async (
  ctx: Context,
  userId: string,
  cursor: Date | null | undefined
) => {
  const initialTrade = await ctx.prisma.tradeHistory.findFirst({
    where: {
      userId,
      ...(cursor ? { TimeStamp: cursor } : {}),
    },
    orderBy: {
      TimeStamp: "asc",
    },
  });

  const tradeTwoWeeks = moment(initialTrade?.TimeStamp)
    .add(2, "weeks")
    .endOf("day");

  const weeklyTradeCount = await ctx.prisma.tradeHistory.count({
    where: {
      userId,
      TimeStamp: {
        ...(initialTrade
          ? {
              gte: initialTrade?.TimeStamp,
              lte: tradeTwoWeeks.toDate(),
            }
          : {}),
      },
    },
    orderBy: {
      TimeStamp: "asc",
    },
  });

  return weeklyTradeCount;
};

export const generateDateRangeUrl = (
  currentUrl: string,
  start: Date | null,
  end: Date | null
): string => {
  let newUrl;

  if (start && end) {
    const formatStart = start ? moment(start).format("MM/DD/YYYY") : "";
    const formatEnd = end ? moment(end).format("MM/DD/YYYY") : "";
    newUrl = `${currentUrl}?from=${formatStart}&to=${formatEnd}`;
  } else {
    newUrl = `${currentUrl}`;
  }

  return newUrl;
};
