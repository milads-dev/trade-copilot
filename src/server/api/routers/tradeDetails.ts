import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";

import { z } from "zod";

export const tradeDetails = createTRPCRouter({
  addTradeNotes: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        date: z.string(),
        note: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { symbol, date, note } = input;

      try {
        const tradeDetails = await ctx.prisma.tradeDetails.findFirst({
          where: { symbol, date },
        });

        if (!tradeDetails)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No Trade Details",
          });

        await ctx.prisma.tradeDetails.update({
          where: { id: tradeDetails.id },
          data: {
            notes: note,
          },
        });

        return { status: 201, message: "Success" };
      } catch (error) {
        const trpcError = error as TRPCError;
        console.error("Error creating trade:", trpcError.message);
      }
    }),
  getTradeDetails: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        date: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { symbol, date } = input;

      try {
        const tradeDetails = await ctx.prisma.tradeDetails.findFirst({
          where: { symbol, date },
        });

        if (!tradeDetails)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No Trade Details",
          });

        return { notes: tradeDetails.notes ?? "", rating: tradeDetails.rating };
      } catch (error) {
        const trpcError = error as TRPCError;
        console.error("Error creating trade:", trpcError.message);
      }
    }),
  addTradeRating: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        date: z.string(),
        rating: z.number().or(z.null()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { symbol, date, rating } = input;

      try {
        const tradeDetails = await ctx.prisma.tradeDetails.findFirst({
          where: { symbol, date },
        });

        if (!tradeDetails)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No Trade Details",
          });

        await ctx.prisma.tradeDetails.update({
          where: { id: tradeDetails.id },
          data: {
            rating,
          },
        });

        return { status: 201, message: "Success" };
      } catch (error) {
        const trpcError = error as TRPCError;
        console.error("Error:", trpcError.message);
      }
    }),
});
