import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";

import { hashSync } from "bcryptjs";
import { z } from "zod";

const encryptPassword = (password: string): string => {
  const saltRounds = 10;
  const hashedPassword: string = hashSync(password, saltRounds);
  return hashedPassword;
};

export const registerRouter = createTRPCRouter({
  createUser: publicProcedure
    .input(
      z.object({
        username: z.string(),
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dbUser = await ctx.prisma.user.findFirst({
        where: { email: input.email },
      });

      if (dbUser)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email Already Exists",
        });

      const hashedPassword = encryptPassword(input.password);

      return ctx.prisma.user.create({
        data: {
          name: input.username,
          email: input.email,
          password: hashedPassword,
        },
      });
    }),
});
