import { registerRouter } from "~/server/api/routers/register";
import { createTRPCRouter } from "~/server/api/trpc";

import { tagsRouter } from "./routers/tags";
import { tradesRouter } from "./routers/trades";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  register: registerRouter,
  trades: tradesRouter,
  tags: tagsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
