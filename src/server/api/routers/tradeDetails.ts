import { priceLineSchema } from "~/features/tradeDetails";
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
  addPriceLine: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        date: z.string(),
        priceLine: priceLineSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { symbol, date, priceLine } = input;

      try {
        const tradeDetails = await ctx.prisma.tradeDetails.findFirst({
          select: {
            id: true,
          },
          where: { symbol, date },
        });

        if (!tradeDetails)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No Trade Details",
          });

        if (priceLine.id) {
          const priceLineFromDb = await ctx.prisma.priceLine.findUnique({
            where: {
              id: priceLine.id,
            },
          });
          if (!priceLineFromDb) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "No Existing Price Line",
            });
          } else
            await ctx.prisma.priceLine.update({
              where: {
                id: priceLineFromDb.id,
              },
              data: {
                ...priceLine,
                price: parseFloat(priceLine.price),
                size: parseInt(priceLine.size),
                style: parseInt(priceLine.style),
              },
            });
        } else {
          const existingPriceLine = await ctx.prisma.priceLine.findFirst({
            where: {
              tradeDetailsId: tradeDetails.id,
              price: parseFloat(priceLine.price),
            },
          });

          if (!existingPriceLine) {
            await ctx.prisma.priceLine.create({
              data: {
                ...priceLine,
                tradeDetailsId: tradeDetails.id,
                price: parseFloat(priceLine.price),
                size: parseInt(priceLine.size),
                style: parseInt(priceLine.style),
              },
            });
          } else {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Price Line Already Exists",
            });
          }

          return { status: 201, message: "Success" };
        }
      } catch (error) {
        const trpcError = error as TRPCError;
        console.error("Error:", trpcError.message);
        throw trpcError;
      }
    }),
  getPriceLines: protectedProcedure
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

        const priceLinesQuery = await ctx.prisma.priceLine.findMany({
          where: {
            tradeDetailsId: tradeDetails.id,
          },
          orderBy: {
            id: "asc",
          },
        });
        const priceLinesWithStrings = priceLinesQuery.map((line) => ({
          ...line,
          price: String(line.price),
          style: String(line.style),
          size: String(line.size),
        }));

        return { priceLines: priceLinesWithStrings };
      } catch (error) {
        const trpcError = error as TRPCError;
        console.error("Error Getting Price Lines:", trpcError.message);
      }
    }),
  deletePriceLines: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        const deletedPriceLine = await ctx.prisma.priceLine.delete({
          where: { id: input },
        });
        return deletedPriceLine;
      } catch (error) {
        console.error("Error Deleting Price Line ", error);
        throw error;
      }
    }),
});
