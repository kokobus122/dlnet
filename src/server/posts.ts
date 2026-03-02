import { db } from "@/db";
import { comment, posts, type NewPost } from "@/db/schema";
import {
  createCommentReplySchema,
  createPostCommentSchema,
} from "@/schema/postSchema";
import { sortBySchema, threadFiltersSchema } from "@/schema/searchSchema";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { like } from "drizzle-orm";

export const createServerPost = createServerFn({
  method: "POST",
})
  .inputValidator((data: NewPost) => data)
  .handler(async ({ data }) => {
    const post = await db
      .insert(posts)
      .values({
        title: data.title,
        authorId: data.authorId,
        content: data.content,
      })
      .returning();
    return post[0];
  });

export const getUserPosts = createServerFn({
  method: "GET",
})
  .inputValidator((data: { authorId: string }) => {
    if (typeof data.authorId !== "string" || data.authorId.length === 0) {
      throw new Error("Invalid author ID");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const userPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, data.authorId));
    return userPosts;
  });

export const getFilteredPosts = createServerFn({
  method: "GET",
})
  .inputValidator(threadFiltersSchema)
  .handler(async ({ data }) => {
    if (data.query === "") {
      const allPosts = await db.select().from(posts);
      return allPosts;
    }
    const filteredPosts = await db
      .select()
      .from(posts)
      .where(like(posts.title, `%${data.query}%`));
    return filteredPosts;
  });

export const getSortedPosts = createServerFn({
  method: "GET",
})
  .inputValidator(sortBySchema)
  .handler(async ({ data }) => {
    const selectedSort = data.sortBy[0] ?? "new";

    const allPosts = await db.query.posts.findMany({
      with: {
        comment: true,
      },
    });

    if (selectedSort === "hot") {
      const randomizedPosts = [...allPosts];
      for (let i = randomizedPosts.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [randomizedPosts[i], randomizedPosts[randomIndex]] = [
          randomizedPosts[randomIndex],
          randomizedPosts[i],
        ];
      }
      return randomizedPosts;
    }

    if (selectedSort === "top") {
      return [...allPosts].sort((a, b) => {
        const commentCountDiff = b.comment.length - a.comment.length;
        if (commentCountDiff !== 0) {
          return commentCountDiff;
        }
        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );
      });
    }

    if (selectedSort === "last-replied") {
      return [...allPosts].sort((a, b) => {
        const latestActivityA = Math.max(
          new Date(a.createdAt ?? 0).getTime(),
          ...(a.comment.map((item) =>
            new Date(item.createdAt ?? 0).getTime(),
          ) ?? []),
        );

        const latestActivityB = Math.max(
          new Date(b.createdAt ?? 0).getTime(),
          ...(b.comment.map((item) =>
            new Date(item.createdAt ?? 0).getTime(),
          ) ?? []),
        );

        return latestActivityB - latestActivityA;
      });
    }

    return [...allPosts].sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    );
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
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, data.id),
      with: {
        comment: true,
      },
    });
    return post;
  });

export const createPostComment = createServerFn({
  method: "POST",
})
  .inputValidator(createPostCommentSchema)
  .handler(async ({ data }) => {
    const insertedComment = await db
      .insert(comment)
      .values({
        postId: data.postId,
        authorId: data.authorId,
        content: data.content,
      })
      .returning();

    return insertedComment[0];
  });

export const createCommentReply = createServerFn({
  method: "POST",
})
  .inputValidator(createCommentReplySchema)
  .handler(async ({ data }) => {
    if (!data.parentCommentId) {
      throw new Error("Parent comment ID is required for a reply");
    }
    const insertedReply = await db
      .insert(comment)
      .values({
        postId: data.postId,
        parentCommentId: data.parentCommentId,
        authorId: data.authorId,
        content: data.content,
      })
      .returning();

    return insertedReply[0];
  });

export const getReplyComments = createServerFn({
  method: "GET",
})
  .inputValidator((data: { parentCommentId: number }) => {
    if (typeof data.parentCommentId !== "number" || data.parentCommentId <= 0) {
      throw new Error("Invalid parent comment ID");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const replies = await db
      .select()
      .from(comment)
      .where(eq(comment.parentCommentId, data.parentCommentId));
    return replies;
  });

export const getServerAllPosts = createServerFn({
  method: "GET",
}).handler(async () => {
  const allPosts = await db.query.posts.findMany({
    with: {
      comment: true,
    },
  });

  const sortedPosts = allPosts.sort((a, b) => {
    const latestActivityA = Math.max(
      new Date(a.createdAt ?? 0).getTime(),
      ...(a.comment.map((item) => new Date(item.createdAt ?? 0).getTime()) ??
        []),
    );

    const latestActivityB = Math.max(
      new Date(b.createdAt ?? 0).getTime(),
      ...(b.comment.map((item) => new Date(item.createdAt ?? 0).getTime()) ??
        []),
    );

    return latestActivityB - latestActivityA;
  });

  return sortedPosts.slice(0, 15);
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
