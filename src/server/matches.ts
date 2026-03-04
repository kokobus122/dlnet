import { db } from "@/db";
import { matches } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";

export const getAllMatches = createServerFn({
  method: "GET",
}).handler(async () => {
  const match = await db.select().from(matches);
  return match;
});
