import { dataBaseTradeArraySchema } from "~/features/tradeHistory";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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
});
