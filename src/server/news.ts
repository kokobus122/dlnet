import { db } from "@/db";
import { news } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { desc } from "drizzle-orm";

export const getAllNews = createServerFn({
  method: "GET",
}).handler(async () => {
  const allNews = await db.query.news.findMany({
    with: {
      comment: true,
    },
    orderBy: [desc(news.createdAt)],
  });
  return allNews;
});
