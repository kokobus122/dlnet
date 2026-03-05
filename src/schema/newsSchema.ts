import z from "zod";

export const newsSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  imageCover: z.string(),
  createdAt: z.date().optional(),
});

export const createNewsCommentSchema = z
  .object({
    newsId: z.number().int().positive(),
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

export const createNewsCommentReplySchema = z
  .object({
    newsId: z.number().int().positive(),
    parentCommentId: z.number().int().positive(),
    authorId: z.string().min(1),
    content: z
      .string()
      .min(1)
      .transform((val) => val.trim()),
  })
  .refine((data) => data.content.length > 0, {
    message: "Reply cannot be empty",
    path: ["content"],
  });
