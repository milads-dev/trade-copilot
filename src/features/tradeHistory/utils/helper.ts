import { type Prisma, type PrismaClient } from "@prisma/client";
import { type DefaultArgs } from "@prisma/client/runtime/library";

import moment from "moment";
import qs from "qs";

import { getDateRangeTimestamps } from "./format";

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
  startDate: Date | null,
  endDate?: Date | null,
  filter?: string | null
): string => {
  const queryObject: { from?: string; to?: string; filter?: string } = {};

  if (startDate) {
    const formattedStart = moment(startDate).format("MM/DD/YYYY");
    queryObject.from = formattedStart;
    queryObject.to = formattedStart;
  }

  if (endDate) {
    queryObject.to = moment(endDate).format("MM/DD/YYYY");
  }

  if (filter) {
    queryObject.filter = filter;
  }

  // Package itself allows for type (any) which conflicts with eslint
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const queryString = qs.stringify(queryObject);

  const separator = currentUrl.includes("?") ? "&" : "?";
  const newUrl = queryString
    ? `${currentUrl}${separator}${queryString}`
    : currentUrl;

  return newUrl;
};

export const fetchTradesByFilter = async (
  ctx: Context,
  filterTag: string,
  startDate: string | null | undefined,
  endDate: string | null | undefined
) => {
  const tradesByTagId = await ctx.prisma.tradeTagRelation.findMany({
    where: {
      userId: ctx.session.user.id,
      tagId: parseFloat(filterTag),
    },
  });
  let response;
  if (typeof startDate === "string" && typeof endDate === "string") {
    const filteredData = tradesByTagId
      .filter((item) => {
        const itemDate = moment(item.date);
        const startDateMoment = moment(startDate);
        const endDateMoment = moment(endDate);

        return (
          itemDate.isSameOrAfter(startDateMoment) &&
          itemDate.isSameOrBefore(endDateMoment)
        );
      })
      .map((item) => item.tradeId);
    response = await ctx.prisma.tradeHistory.findMany({
      where: {
        userId: ctx.session.user.id,
        tradeDetailsId: {
          in: filteredData,
        },
      },
      orderBy: {
        TimeStamp: "asc",
      },
    });
  } else {
    const filteredData = tradesByTagId.map((item) => item.tradeId);
    response = await ctx.prisma.tradeHistory.findMany({
      where: {
        userId: ctx.session.user.id,
        tradeDetailsId: {
          in: filteredData,
        },
      },
      orderBy: {
        TimeStamp: "asc",
      },
    });
  }

  return response;
};
export const getRunningPnL = async (
  ctx: Context,
  currentDate: string,
  symbol: string
) => {
  const { timeStampStart, timeStampEnd } = getDateRangeTimestamps(
    currentDate,
    currentDate
  );

  const trades = await ctx.prisma.tradeHistory.findMany({
    where: {
      userId: ctx.session.user.id,
      Symbol: symbol,
      TimeStamp: { gte: timeStampStart, lte: timeStampEnd },
    },
    select: {
      Profit: true,
      TimeStamp: true,
    },
    orderBy: {
      TimeStamp: "asc",
    },
  });

  if (trades.length === 0) {
    return [
      {
        time: Math.floor(new Date(timeStampStart).getTime() / 1000),
        value: 0,
      },
    ];
  }

  const firstTradeTime = new Date(trades[0]!.TimeStamp).getTime() / 1000;

  let cumulativePnL = 0;

  const chartData = [
    {
      time: Math.floor(firstTradeTime) - 60,
      value: 0,
    },
  ];

  for (const trade of trades) {
    cumulativePnL += trade.Profit;

    if (trade.Profit === 0) continue;

    chartData.push({
      time: Math.floor(new Date(trade.TimeStamp).getTime() / 1000),
      value: Number(cumulativePnL.toFixed(2)),
    });
  }

  return chartData;
};

export const fetchTradesByDateRange = async (
  ctx: Context,
  startDate: string,
  endDate: string
) => {
  const { timeStampStart, timeStampEnd } = getDateRangeTimestamps(
    startDate,
    endDate
  );

  const response = await ctx.prisma.tradeHistory.findMany({
    where: {
      userId: ctx.session.user.id,
      TimeStamp: {
        gte: timeStampStart,
        lte: timeStampEnd,
      },
    },
    orderBy: {
      TimeStamp: "asc",
    },
  });

  return response;
};

type NextCursor =
  | {
      id?: number | null | undefined;
      date?: Date | null | undefined;
    }
  | undefined;

export const fetchTradeDataToInfinity = async (
  ctx: Context,
  userId: string,
  cursor?: { id?: number | null; date?: Date | null }
) => {
  let nextCursor: NextCursor;

  const weeklyTradeCount = await fetchTradeCount(ctx, userId, cursor?.date);

  const lastTradeId = await ctx.prisma.tradeHistory.findFirst({
    select: {
      id: true,
    },
    orderBy: {
      TimeStamp: "desc",
    },
  });

  const response = await ctx.prisma.tradeHistory.findMany({
    take: weeklyTradeCount + 1,
    cursor: cursor
      ? {
          TimeStamp: cursor.date ?? undefined,
          id: cursor.id ?? undefined,
        }
      : undefined,
    where: {
      userId: ctx.session.user.id,
    },
    orderBy: {
      TimeStamp: "asc",
    },
  });

  const nextTradeId = response[weeklyTradeCount - 1]?.id ?? weeklyTradeCount;

  if (lastTradeId!.id !== nextTradeId) {
    const nextTrade = response.pop();

    nextCursor = {
      id: nextTrade?.id,
      date: nextTrade?.TimeStamp,
    };
  }

  return { response, nextCursor };
};
