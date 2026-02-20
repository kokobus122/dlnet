import z from "zod";

export const uploadAvatarSchema = z.object({
  file: z.instanceof(ArrayBuffer),
  fileName: z.string(),
  userId: z.string().nonempty("User ID is required"),
});
