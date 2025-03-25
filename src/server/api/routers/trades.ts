import { candleStickSchema } from "~/features/tradeDetails/type";
import {
  formatToUnix,
  generateTradeDetailsUrl,
  getSymbol,
  timeToLocal,
} from "~/features/tradeDetails/utils";
import {
  dataBaseTradeArraySchema,
  type dataBaseTradeArrayType,
  fetchTradeDataToInfinity,
  fetchTradesByDateRange,
  fetchTradesByFilter,
  formatUtcTimestamp,
  processDailyTrades,
} from "~/features/tradeHistory";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";

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
        cursor: z
          .object({
            id: z.number().nullish(),
            date: z.date().nullish(),
          })
          .nullish(),
        startDate: z.string().nullish(),
        endDate: z.string().nullish(),
        filterTag: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, startDate, endDate, filterTag } = input;

      const userId = ctx.session.user.id;

      try {
        let response;
        let nextCursor: typeof cursor | undefined = undefined;

        if (filterTag) {
          response = await fetchTradesByFilter(
            ctx,
            filterTag,
            startDate,
            endDate
          );
        } else if (startDate && endDate) {
          response = await fetchTradesByDateRange(ctx, startDate, endDate);
        } else {
          const { response: infiniteResponse, nextCursor: infiniteCursor } =
            await fetchTradeDataToInfinity(ctx, userId, cursor!);
          response = infiniteResponse;
          nextCursor = infiniteCursor;
        }

        const formattedTrades = response.map((trade) => {
          const utcTimestamp = formatUtcTimestamp(trade.TimeStamp);

          return {
            ...trade,
            TimeStamp: utcTimestamp,
          };
        });

        const sortedTrades = processDailyTrades(formattedTrades).sort(
          (a, b) =>
            new Date(a.openTimeStamp).getTime() -
            new Date(b.openTimeStamp).getTime()
        );
        return { trades: sortedTrades, nextCursor };
      } catch (error) {
        console.error("Error retrieving trades:", error);
        throw new Error("Failed to retrieve trades.");
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

        const tradeDetails = await ctx.prisma.tradeDetails.findFirst({
          where: {
            symbol,
            date,
            tradeHistory: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        });
        if (!tradeDetails) {
          const createdTradeDetails = await ctx.prisma.tradeDetails.create({
            data: { symbol, date },
          });
          const tradeHistoryIds = await ctx.prisma.$queryRaw<{ id: number }[]>`
          SELECT "id"
          FROM "TradeHistory"
          WHERE DATE_TRUNC('day', "TimeStamp") = DATE_TRUNC('day', ${date}::date)
          AND "Symbol" = ${symbol};
        `;

          const formattedTradeIds = tradeHistoryIds.map((item) => item.id);
          await ctx.prisma.tradeHistory.updateMany({
            where: {
              id: {
                in: formattedTradeIds,
              },
            },
            data: {
              tradeDetailsId: createdTradeDetails.id,
            },
          });
        }

        const result = await ctx.prisma.$queryRaw<dataBaseTradeArrayType>`
          SELECT "Symbol", "TimeStamp", "Volume", "Price", "Profit"
          FROM "TradeHistory"
          WHERE DATE_TRUNC('day', "TimeStamp") = DATE_TRUNC('day', ${date}::date)
          AND "Symbol" = ${symbol}
          AND "userId" = ${ctx.session.user.id}
          ORDER BY "TimeStamp" ASC;
        `;
        const formatedTrades = result.map((trades) => ({
          ...trades,
          Marker: formatToUnix(trades.TimeStamp),
        }));

        const lastTrade = await ctx.prisma.tradeHistory.findFirst({
          where: {
            TimeStamp: {
              lt: formatedTrades[0]?.TimeStamp,
            },
          },
          select: { Symbol: true, TimeStamp: true },
          orderBy: {
            TimeStamp: "desc",
          },
        });

        const lastTradeUrl = lastTrade
          ? generateTradeDetailsUrl(
              "/trades",
              lastTrade.Symbol,
              lastTrade.TimeStamp
            )
          : null;

        const nextTrade = await ctx.prisma.tradeHistory.findFirst({
          where: {
            TimeStamp: {
              gt: formatedTrades[formatedTrades.length - 1]?.TimeStamp,
            },
          },
          select: { Symbol: true, TimeStamp: true },
          orderBy: {
            TimeStamp: "asc",
          },
        });

        const nextTradeUrl = nextTrade
          ? generateTradeDetailsUrl(
              "/trades",
              nextTrade.Symbol,
              nextTrade.TimeStamp
            )
          : null;

        return {
          dailyTrades: formatedTrades,
          lastTrade: lastTradeUrl,
          nextTrade: nextTradeUrl,
        };
      } catch (error) {
        console.error("Error retrieving trades:", error);
        return { dailyTrades: [], lastTrade: null, nextTrade: null };
      }
    }),
  getChartData: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        date: z.string(),
        timeFrame: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { symbol, date, timeFrame } = input;

      const { validSymbol } = getSymbol(symbol);

      try {
        const data: unknown = await (
          await fetch(
            `https://api.twelvedata.com/time_series?apikey=${process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY}&interval=${timeFrame}min&symbol=${validSymbol}&dp=2&start_date=${date} 9:30:00&end_date=${date} 16:00:00`
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

  getStats: protectedProcedure
    .input(
      z.object({
        startDate: z.string().nullish(),
        endDate: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input;

      try {
        let response;

        if (typeof startDate === "string" && typeof endDate === "string") {
          response = await fetchTradesByDateRange(ctx, startDate, endDate);
        } else {
          response = await ctx.prisma.tradeHistory.findMany({
            where: {
              userId: ctx.session.user.id,
            },
            orderBy: {
              TimeStamp: "asc",
            },
          });
        }
        if (!response) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Error Retrieving Trades",
          });
        }
        const formattedTrades = response.map((trade) => {
          const utcTimestamp = formatUtcTimestamp(trade.TimeStamp);
          return {
            ...trade,
            TimeStamp: utcTimestamp,
          };
        });

        const areaDataPnl = processDailyTrades(formattedTrades)
          .map((trade) => {
            const unixTime = formatToUnix(trade.openTimeStamp);
            return {
              value: trade.Profit,
              time: unixTime,
            };
          })
          .sort((a, b) => a.time - b.time);

        return {
          tradeStats: processDailyTrades(formattedTrades),
          areaData: areaDataPnl,
        };
      } catch (error) {
        console.error("Error", error);
        return {};
      }
    }),
});
