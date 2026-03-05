import { db } from "@/db";
import { comment, news } from "@/db/schema";
import { richTextToPlainText, sanitizeRichTextHtml } from "@/lib/rich-text";
import {
  createNewsCommentReplySchema,
  createNewsCommentSchema,
  newsSchema,
} from "@/schema/newsSchema";
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
  .inputValidator(
    newsSchema.omit({ id: true, createdAt: true }).extend({
      imageCover: newsSchema.shape.imageCover.optional().default(""),
    }),
  )
  .handler(async ({ data }) => {
    const sanitizedContent = sanitizeRichTextHtml(data.content);
    if (richTextToPlainText(sanitizedContent).length === 0) {
      throw new Error("News content cannot be empty");
    }

    const insertedNews = await db
      .insert(news)
      .values({
        title: data.title,
        content: sanitizedContent,
        imageCover: data.imageCover || "",
        createdAt: new Date(),
      })
      .returning();

    return insertedNews[0];
  });

export const createNewsComment = createServerFn({
  method: "POST",
})
  .inputValidator(createNewsCommentSchema)
  .handler(async ({ data }) => {
    const sanitizedContent = sanitizeRichTextHtml(data.content);
    if (richTextToPlainText(sanitizedContent).length === 0) {
      throw new Error("Comment content cannot be empty");
    }

    const insertedComment = await db
      .insert(comment)
      .values({
        newsId: data.newsId,
        authorId: data.authorId,
        content: sanitizedContent,
      })
      .returning();

    return insertedComment[0];
  });

export const createNewsCommentReply = createServerFn({
  method: "POST",
})
  .inputValidator(createNewsCommentReplySchema)
  .handler(async ({ data }) => {
    if (!data.parentCommentId) {
      throw new Error("Parent comment ID is required for a reply");
    }

    const sanitizedContent = sanitizeRichTextHtml(data.content);
    if (richTextToPlainText(sanitizedContent).length === 0) {
      throw new Error("Reply content cannot be empty");
    }

    const insertedReply = await db
      .insert(comment)
      .values({
        newsId: data.newsId,
        parentCommentId: data.parentCommentId,
        authorId: data.authorId,
        content: sanitizedContent,
      })
      .returning();

    return insertedReply[0];
  });
