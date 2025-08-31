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

import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { Time } from "lightweight-charts";
import moment from "moment";
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

  getRecentTradeDays: protectedProcedure.query(async ({ ctx }) => {
    const allTimestamps = await ctx.prisma.tradeHistory.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        TimeStamp: true,
      },
      orderBy: {
        TimeStamp: "desc",
      },
    });

    const uniqueDates = Array.from(
      new Set(
        allTimestamps.map(
          (t) => t.TimeStamp.toISOString().split("T")[0] // Extract date only
        )
      )
    ).slice(0, 5);

    return uniqueDates;
  }),

  getRecentTradeCharts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const recentTrades = await ctx.prisma.tradeHistory.findMany({
      where: { userId: userId },
      orderBy: { TimeStamp: "desc" },
      take: 300, // buffer in case trades happened multiple times a day
    });

    // Group by day+symbol, pick 5 most recent trading days
    const uniqueByDate = new Map<string, { date: string; symbol: string }>();

    for (const trade of recentTrades) {
      const date = trade.TimeStamp.toISOString().split("T")[0] as string;

      const key = `${date}-${trade.Symbol}`;
      if (!uniqueByDate.has(key) && uniqueByDate.size < 3) {
        uniqueByDate.set(key, { date, symbol: trade.Symbol });
      }
    }
    const chartResponses: {
      date: string;
      symbol: string;
      data: { time: Time; value: number }[];
    }[] = [];

    for (const { date, symbol } of uniqueByDate.values()) {
      const response = await fetch(
        `https://api.twelvedata.com/time_series?apikey=${process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY}&interval=15min&symbol=qqq&dp=2&start_date=${date} 09:30:00&end_date=${date} 16:00:00`
      );

      const raw = await response.json();
      const parsed = candleStickSchema.parse(raw);

      const chartData = parsed.values.reverse().map(({ datetime, close }) => ({
        time: Math.floor(new Date(datetime).getTime() / 1000) as Time,
        value: parseFloat(close),
      }));

      chartResponses.push({ date, data: chartData, symbol });
    }

    return chartResponses;
  }),
  getCarouselTrades: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(), // format: '2025-07-07-MNQU5'
        limit: z.number().min(1).max(10).default(3),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const recentTrades = await ctx.prisma.tradeHistory.findMany({
        where: { userId },
        orderBy: { TimeStamp: "desc" },
        take: 500,
      });

      // Create map of unique day-symbol keys
      const uniqueByDate = new Map<string, { date: string; symbol: string }>();
      for (const trade of recentTrades) {
        const date = trade.TimeStamp.toISOString().split("T")[0] as string;
        const key = `${date}-${trade.Symbol}`;
        if (!uniqueByDate.has(key)) {
          uniqueByDate.set(key, { date, symbol: trade.Symbol });
        }
      }

      const allKeys = Array.from(uniqueByDate.keys()).sort((a, b) => {
        const [dateA] = a.split("-");
        const [dateB] = b.split("-");
        return dateB!.localeCompare(dateA!);
      });

      const startIndex = input.cursor
        ? allKeys.findIndex((k) => k === input.cursor) + 1
        : 0;
      const paginatedKeys = allKeys.slice(startIndex, startIndex + input.limit);

      const chartResponses: {
        date: string;
        symbol: string;
        data: { time: Time; value: number }[];
      }[] = [];

      for (const key of paginatedKeys) {
        const { date, symbol } = uniqueByDate.get(key)!;
        const response = await fetch(
          `https://api.twelvedata.com/time_series?apikey=${process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY}&interval=15min&symbol=${symbol}&dp=2&start_date=${date} 09:30:00&end_date=${date} 16:00:00`
        );

        const raw = await response.json();
        const parsed = candleStickSchema.parse(raw);

        const chartData = parsed.values
          .reverse()
          .map(({ datetime, close }) => ({
            time: Math.floor(new Date(datetime).getTime() / 1000) as Time,
            value: parseFloat(close),
          }));

        chartResponses.push({ date, data: chartData, symbol });
      }

      const nextCursor =
        startIndex + input.limit < allKeys.length
          ? allKeys[startIndex + input.limit - 1]
          : null;

      return {
        charts: chartResponses,
        nextCursor,
      };
    }),
  getInfiniteChartData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const trades = await ctx.prisma.$queryRaw<
      {
        id: number;
        TimeStamp: Date;
        Symbol: string;
        Volume: number;
        Price: number;
        Profit: number;
        tradeDetailsId: number | null;
      }[]
    >`
      SELECT DISTINCT ON ("Symbol", DATE("TimeStamp")) *
      FROM "TradeHistory"
      WHERE "userId" = ${userId}
      ORDER BY DATE("TimeStamp") DESC, "Symbol", "TimeStamp" DESC
      LIMIT 1;
    `;
    const results = await Promise.all(
      trades.map(async ({ Symbol, TimeStamp }) => {
        const dateStr = moment(TimeStamp).format("YYYY-MM-DD");

        const start = `${dateStr} 09:30:00`;
        const end = `${dateStr} 16:00:00`;

        const response = await fetch(
          `https://api.twelvedata.com/time_series?apikey=${process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY}&interval=15min&symbol=QQQ&dp=2&start_date=${start}&end_date=${end}`
        );
        const json = await response.json();
        console.log("json", json);
        return {
          symbol: Symbol,
          date: dateStr,
          candlesticks: json?.values ?? [],
        };
      })
    );

    return results;
  }),
  getInfiniteChartData1: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            cursorTimestamp: z.string(),
            cursorSymbol: z.string(),
          })
          .optional(),
        limit: z.number().min(1).max(50).default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const userId = ctx.session.user.id;

      const cursorConditionGroupedProfits = cursor
        ? Prisma.sql`AND (DATE("TimeStamp") < DATE(${cursor.cursorTimestamp}) OR (DATE("TimeStamp") = DATE(${cursor.cursorTimestamp}) AND "Symbol" > ${cursor.cursorSymbol}))`
        : Prisma.empty;

      const cursorConditionTradesWithProfit = cursor
        ? Prisma.sql`AND (DATE(t."TimeStamp") < DATE(${cursor.cursorTimestamp}) OR (DATE(t."TimeStamp") = DATE(${cursor.cursorTimestamp}) AND t."Symbol" > ${cursor.cursorSymbol}))`
        : Prisma.empty;

      const query = Prisma.sql`
  WITH grouped_profits AS (
    SELECT
      "Symbol",
      DATE("TimeStamp") AS trade_date,
      SUM("Profit") AS total_profit
    FROM "TradeHistory"
    WHERE "userId" = ${userId}
    ${cursorConditionGroupedProfits}
    GROUP BY "Symbol", trade_date
  ),
  trades_with_profit AS (
    SELECT DISTINCT ON (t."Symbol", DATE(t."TimeStamp"))
      t.*,
      gp.total_profit
    FROM "TradeHistory" t
    JOIN grouped_profits gp
      ON gp."Symbol" = t."Symbol"
     AND gp.trade_date = DATE(t."TimeStamp")
    WHERE t."userId" = ${userId}
    ${cursorConditionTradesWithProfit}
    ORDER BY DATE(t."TimeStamp") DESC, t."Symbol", t."TimeStamp" DESC
    LIMIT ${limit}
  )
  SELECT * FROM trades_with_profit;
`;

      const trades = await ctx.prisma.$queryRaw<
        {
          id: number;
          TimeStamp: Date;
          Symbol: string;
          Volume: number;
          Price: number;
          Profit: number;
          tradeDetailsId: number | null;
          total_profit: number;
        }[]
      >(query);

      const results = await Promise.all(
        trades.map(async ({ Symbol, TimeStamp, total_profit }) => {
          const dateStr = moment(TimeStamp).format("YYYY-MM-DD");
          const start = `${dateStr} 09:30:00`;
          const end = `${dateStr} 16:00:00`;

          try {
            const response = await fetch(
              `https://api.twelvedata.com/time_series?apikey=${process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY}&interval=15min&symbol=QQQ&dp=2&start_date=${start}&end_date=${end}`
            );
            const json = await response.json();

            const parsed = candleStickSchema.parse(json);
            const chartData = (parsed?.values ?? [])
              .map((c) => ({
                time: Math.floor(new Date(c.datetime).getTime() / 1000),
                value: parseFloat(c.close),
              }))
              .sort((a, b) => a.time - b.time) as {
              time: Time;
              value: number;
            }[];

            return {
              symbol: Symbol,
              date: dateStr,
              totalProfit: total_profit,
              chartData,
            };
          } catch (error) {
            return {
              symbol: Symbol,
              date: dateStr,
              totalProfit: 0,
              error: "fetch_failed",
              chartData: [],
            };
          }
        })
      );

      const last = trades[trades.length - 1];
      const nextCursor = last
        ? {
            cursorTimestamp: last.TimeStamp.toISOString(),
            cursorSymbol: last.Symbol,
          }
        : null;

      return {
        data: results,
        nextCursor,
      };
    }),
});
