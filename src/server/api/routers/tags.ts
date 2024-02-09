import { formatTradeTags } from "~/features/tradeDetails";
import {
  type Tag,
  type TradeTag,
  generateTagDateRangeQuery,
  generateTagQuery,
  sortTradeTags,
} from "~/features/tradeStats";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { z } from "zod";

export const tagsRouter = createTRPCRouter({
  addTag: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.string(),
        symbol: z.string(),
        date: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, type, symbol, date } = input;
      const existingTag = await ctx.prisma.tag.findFirst({
        where: { name, userId: ctx.session.user.id },
      });

      if (existingTag)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tag Already Exists",
        });
      try {
        const tag = await ctx.prisma.tag.create({
          data: {
            name: name,
            userId: ctx.session.user.id,
            type: type.toLowerCase(),
          },
        });
        if (tag) {
          const tradeDetails = await ctx.prisma.tradeDetails.findFirst({
            where: { symbol, date },
            select: { id: true },
          });

          if (!tradeDetails)
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "No Trade Details",
            });
          await ctx.prisma.tradeTagRelation.create({
            data: {
              tagId: tag.id,
              userId: ctx.session.user.id,
              symbol,
              date,
              tradeId: tradeDetails.id,
            },
          });
        }
        return tag;
      } catch (error) {
        console.error("Error creating tag:", error);
        return {};
      }
    }),
  getTags: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        date: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { symbol, date } = input;

      try {
        const tags = await ctx.prisma.tag.findMany({
          where: {
            userId: ctx.session.user.id,
          },
        });

        const tradeTagRelations = await ctx.prisma.tradeTagRelation.findMany({
          where: {
            symbol,
            date,
            userId: ctx.session.user.id,
          },
          select: {
            id: true,
            tag: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        });

        const flattenedTags = tradeTagRelations.map(({ id, tag }) => ({
          id,
          ...tag,
        }));

        return {
          allTags: formatTradeTags(tags),
          tradeTags: formatTradeTags(flattenedTags),
        };
      } catch (error) {
        console.error("Error retrieving trades:", error);
        return {};
      }
    }),
  removeTag: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        tagArray: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, tagArray } = input;
        if (tagArray) {
          const deletedTradeTagRelations =
            await ctx.prisma.tradeTagRelation.deleteMany({
              where: { id: { in: tagArray } },
            });
          return deletedTradeTagRelations;
        }
        const removedTag = await ctx.prisma.tradeTagRelation.delete({
          where: { id: id },
        });
        return removedTag;
      } catch (error) {
        console.error("Error removing trade tag", error);
      }
    }),

  deleteTag: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        const deletedTag = await ctx.prisma.tag.delete({
          where: { id: input, userId: ctx.session.user.id },
        });
        return deletedTag;
      } catch (error) {
        console.error("Error deleting trade tag", error);
        throw error;
      }
    }),

  addTagToTrade: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        symbol: z.string(),
        date: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, symbol, date } = input;
      try {
        const tradeDetails = await ctx.prisma.tradeDetails.findFirst({
          where: { symbol, date },
          select: { id: true },
        });

        if (!tradeDetails)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No Trade Details",
          });

        const tradeTag = await ctx.prisma.tradeTagRelation.create({
          data: {
            tagId: id,
            userId: ctx.session.user.id,
            symbol,
            date,
            tradeId: tradeDetails.id,
          },
        });
        return tradeTag;
      } catch (error) {
        console.error("Error adding tag to trade", error);
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
      const userId = ctx.session.user.id;

      try {
        const tagQuery = generateTagQuery(startDate, endDate, userId);

        const tags = await ctx.prisma.$queryRaw<Tag[]>(Prisma.sql([tagQuery]));

        if (!tags)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Error Retrieving Tag data",
          });

        return {
          tags,
        };
      } catch (error) {
        console.error("Error retrieving tag data:", error);
        return {};
      }
    }),
  getTagsByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input;
      const userId = ctx.session.user.id;

      try {
        const tagDateRangeQuery = generateTagDateRangeQuery(
          startDate,
          endDate,
          userId
        );

        const tags = await ctx.prisma.$queryRaw<TradeTag[]>(
          Prisma.sql([tagDateRangeQuery])
        );

        if (!tags)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Error Retrieving Tag data",
          });

        const sortedTags = sortTradeTags(tags);

        return {
          tags: sortedTags,
        };
      } catch (error) {
        console.error("Error retrieving tag data:", error);
        return {};
      }
    }),
});
