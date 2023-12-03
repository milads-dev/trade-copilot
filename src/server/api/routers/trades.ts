import { candleStickSchema } from "~/features/tradeDetails/type";
import {
  formatToUnix,
  getMarketTimes,
  getSymbol,
  timeToLocal,
} from "~/features/tradeDetails/utils";
import {
  dataBaseTradeArraySchema,
  type dataBaseTradeArrayType,
  fetchTradeCount,
  formatUtcTimestamp,
  getDateRangeTimestamps,
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
        startDate: z.string().nullish(),
        endDate: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, startDate, endDate } = input;

      const userId = ctx.session.user.id;

      try {
        let response;
        let nextCursor: typeof cursor | undefined = undefined;

        if (typeof startDate === "string" && typeof endDate === "string") {
          const { timeStampStart, timeStampEnd } = getDateRangeTimestamps(
            startDate,
            endDate
          );

          response = await ctx.prisma.tradeHistory.findMany({
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
          Marker: formatToUnix(trades.TimeStamp),
        }));

        return { dailyTrades: formatedTrades };
      } catch (error) {
        console.error("Error retrieving trades:", error);
        return { dailyTrades: [] };
      }
    }),
  getTradeDetails: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        date: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { symbol, date } = input;

      const { validSymbol } = getSymbol(symbol);

      try {
        const data: unknown = await (
          await fetch(
            `https://api.twelvedata.com/time_series?apikey=${process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY}&interval=1min&symbol=${validSymbol}&dp=2&start_date=${date} 9:30:00&end_date=${date} 16:00:00`
          )
        ).json();

        const result = candleStickSchema.parse(data);

        const formatResponse = result.values
          .reverse()
          .map(({ datetime, open, high, low, close, volume }) => {
            return {
              time: timeToLocal(datetime),
              open: parseFloat(open),
              high: parseFloat(high),
              low: parseFloat(low),
              close: parseFloat(close),
              volume: parseFloat(volume),
            };
          });

        return { data: formatResponse };
      } catch (error) {
        console.error("Error retrieving candles:", error);
        return { data: [] };
      }
    }),
});
