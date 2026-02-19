import z from "zod";

export const uploadAvatarSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "File size must be less than 5MB",
  }),
  userId: z.string().nonempty("User ID is required"),
});
