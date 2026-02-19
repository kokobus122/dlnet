import { db } from "@/db";
import { posts, type NewPost } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

export const createServerPost = createServerFn({
  method: "POST",
})
  .inputValidator((data: NewPost) => data)
  .handler(async ({ data }) => {
    const post = await db.insert(posts).values({
      title: data.title,
      authorId: data.authorId,
      content: data.content,
    });
    return post;
  });

export const getServerPostById = createServerFn({
  method: "GET",
})
  .inputValidator((data: { id: number }) => {
    if (typeof data.id !== "number" || data.id <= 0) {
      throw new Error("Invalid post ID");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const post = await db.select().from(posts).where(eq(posts.id, data.id));
    return post;
  });

export const getServerAllPosts = createServerFn({
  method: "GET",
}).handler(async () => {
  const allPosts = await db.select().from(posts);
  return allPosts;
});

export const getServerPostPage = createServerFn({
  method: "GET",
})
  .inputValidator((data: { page: number; limit: number }) => {
    if (
      typeof data.page !== "number" ||
      data.page <= 0 ||
      typeof data.limit !== "number" ||
      data.limit <= 0
    ) {
      throw new Error("Invalid pagination parameters");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const postsPage = await db
      .select()
      .from(posts)
      .limit(data.limit)
      .offset((data.page - 1) * data.limit);
    return postsPage;
  });

export const getServerPostAuthor = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number }) => {
    if (typeof data.id !== "number" || data.id <= 0) {
      throw new Error("Invalid post ID");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const post = await db
      .select({
        authorId: posts.authorId,
      })
      .from(posts)
      .where(eq(posts.id, data.id));
    if (post.length === 0) {
      throw new Error("Post not found");
    }
    return { author: post[0].authorId }; // ?
  });
