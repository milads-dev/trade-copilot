import {
  DateRangeSchema,
  dataBaseTradeArraySchema,
  type dataBaseTradeArrayType,
  fetchTradeCount,
  formatUtcTimestamp,
  processDailyTrades,
} from "~/features/tradeHistory";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { z } from "zod";

export const tradesRouter = createTRPCRouter({
  addTrades: protectedProcedure
    .input(dataBaseTradeArraySchema)
    .mutation(async ({ ctx, input }) => {
      const trades = input.map((trade) => {
        return {
          ...trade,
          userId: ctx.session.user.id,
        };
      });

      try {
        const response = await ctx.prisma.tradeHistory.createMany({
          data: trades,
          skipDuplicates: true,
        });
        return response.count;
      } catch (error) {
        console.error("Error creating trade:", error);
      }
    }),
  getTrades: protectedProcedure
    .input(
      z.object({
        cursor: z.number().nullish(),
        dateRange: DateRangeSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, dateRange } = input;
      const userId = ctx.session.user.id;

      try {
        let response;
        let nextCursor: typeof cursor | undefined = undefined;

        if (
          dateRange !== undefined &&
          dateRange.every((item) => item instanceof Date)
        ) {
          const [startDate, endDate] = dateRange;

          response = await ctx.prisma.tradeHistory.findMany({
            where: {
              userId: ctx.session.user.id,
              TimeStamp: {
                gte: new Date(startDate!),
                lte: new Date(endDate!),
              },
            },
            orderBy: {
              TimeStamp: "asc",
            },
          });
        } else {
          const weeklyTradeCount = await fetchTradeCount(ctx, userId, cursor);

          const lastTradeId = await ctx.prisma.tradeHistory.findFirst({
            select: {
              id: true,
            },
            orderBy: {
              TimeStamp: "desc",
            },
          });

          response = await ctx.prisma.tradeHistory.findMany({
            take: weeklyTradeCount + 1,
            cursor: cursor ? { id: cursor } : undefined,
            where: {
              userId: ctx.session.user.id,
            },
            orderBy: {
              TimeStamp: "asc",
            },
          });

          const nextTradeId =
            response[weeklyTradeCount - 1]?.id ?? weeklyTradeCount;

          if (lastTradeId!.id > nextTradeId) {
            const nextTrade = response.pop();

            nextCursor = nextTrade?.id;
          }
        }

        const formattedTrades = response.map((trade) => {
          const utcTimestamp = formatUtcTimestamp(trade.TimeStamp);

          return {
            ...trade,
            TimeStamp: utcTimestamp,
          };
        });

        return { trades: processDailyTrades(formattedTrades), nextCursor };
      } catch (error) {
        console.error("Error retrieving trades:", error);
      }
    }),

  getTradesByDate: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        date: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { symbol, date } = input;

      try {
        if (symbol.length === 0 || date.length === 0)
          return { dailyTrades: [] };
        const result = await ctx.prisma.$queryRaw<dataBaseTradeArrayType>`
          SELECT "Symbol", "TimeStamp", "Volume", "Price", "Profit"
          FROM "TradeHistory"
          WHERE DATE_TRUNC('day', "TimeStamp") = DATE_TRUNC('day', ${date}::date)
          AND "Symbol" = ${symbol};
        `;
        const formatedTrades = result.map((trades) => ({
          ...trades,
          TimeStamp: formatUtcTimestamp(new Date(trades.TimeStamp)),
        }));

        return { dailyTrades: formatedTrades };
      } catch (error) {
        console.error("Error retrieving trades:", error);
        return { dailyTrades: [] };
      }
    }),
});
