import { db } from "@/db";
import { news } from "@/db/schema";
import { richTextToPlainText, sanitizeRichTextHtml } from "@/lib/rich-text";
import { newsSchema } from "@/schema/newsSchema";
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
    const specificNews = await db.query.news.findFirst({
      where: eq(news.id, data.id),
      with: {
        comment: true,
      },
    });
    return specificNews;
  });

export const createNews = createServerFn({
  method: "POST",
})
  .inputValidator(newsSchema)
  .handler(async ({ data }) => {
    const sanitizedContent = sanitizeRichTextHtml(data.content);
    if (richTextToPlainText(sanitizedContent).length === 0) {
      throw new Error("News content cannot be empty");
    }

    const insertedNews = await db
      .insert(news)
      .values({
        id: Number(data.id),
        title: data.title,
        content: sanitizedContent,
        imageCover: data.imageCover,
        createdAt: new Date(),
      })
      .returning();

    return insertedNews[0];
  });
