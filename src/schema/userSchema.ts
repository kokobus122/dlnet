import z from "zod";

export const filterUserSchema = z.object({
  query: z.string().min(2),
});
