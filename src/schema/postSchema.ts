import z from "zod";

export const createPostCommentSchema = z
  .object({
    postId: z.number().int().positive(),
    authorId: z.string().min(1),
    content: z
      .string()
      .min(1)
      .transform((val) => val.trim()),
  })
  .refine((data) => data.content.length > 0, {
    message: "Comment cannot be empty",
    path: ["content"],
  });

export const createCommentReplySchema = z
  .object({
    postId: z.number().int().positive(),
    parentCommentId: z.number().int().positive(),
    authorId: z.string().min(1),
    content: z
      .string()
      .min(1)
      .transform((val) => val.trim()),
  })
  .refine((data) => data.content.length > 0, {
    message: "Reply cannot be empty",
  });
