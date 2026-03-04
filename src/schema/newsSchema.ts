import z from "zod";

export const newsSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  imageCover: z.string(),
  createdAt: z.date().optional(),
});
