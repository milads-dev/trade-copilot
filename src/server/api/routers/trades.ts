import {
  dataBaseTradeArraySchema,
  formatUtcTimestamp,
  processDailyTrades,
} from "~/features/tradeHistory";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const tradesRouter = createTRPCRouter({
  getTrades: protectedProcedure.query(async ({ ctx }) => {
    try {
      const allTrades = await ctx.prisma.tradeHistory.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        orderBy: {
          TimeStamp: "asc",
        },
      });

      const formattedTrades = allTrades.map(
        ({ TimeStamp, Symbol, Price, Profit, Volume }) => {
          const utcTimestamp = formatUtcTimestamp(TimeStamp);

          return {
            Symbol,
            Price,
            Profit,
            Volume,
            TimeStamp: utcTimestamp,
          };
        }
      );

      const dailyTrades = processDailyTrades(formattedTrades);
      return { trades: dailyTrades };
    } catch (error) {
      console.error("Error retrieving trades:", error);
    }
  }),
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
});
