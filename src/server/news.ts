import { db } from "@/db";
import { news } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";

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

export const getSpecificNews = createServerFn({
  method: "GET",
})
  .inputValidator((data: { id: number }) => {
    if (typeof data.id !== "number" || data.id <= 0) {
      throw new Error("Invalid news ID");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const specificNews = await db
      .select()
      .from(news)
      .where(eq(news.id, data.id));
    return specificNews[0];
  });
