import { db } from "@/db";
import { supabase } from "@/lib/supabase";
import { uploadAvatarSchema } from "@/schema/uploadAvatar";
import { createServerFn } from "@tanstack/react-start";
import { eq, like } from "drizzle-orm";
import { user } from "../../drizzle/schema";
import { filterUserSchema } from "@/schema/userSchema";

export const getServerUser = createServerFn({
  method: "GET",
})
  .inputValidator((data: { id: string }) => {
    if (typeof data.id !== "string" || data.id.length === 0) {
      throw new Error("Invalid user ID");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const selectedUser = await db
      .select()
      .from(user)
      .where(eq(user.id, data.id));
    return selectedUser[0];
  });


export const getFilteredUsers = createServerFn({
  method: "GET",
})
  .inputValidator(filterUserSchema)
  .handler(async ({ data }) => {
    const users = await db
      .select()
      .from(user)
      .where(like(user.name, `%${data.query}%`));
    return users;
  });

export const uploadAvatar = createServerFn({
  method: "POST",
})
  .inputValidator(uploadAvatarSchema)
  .handler(async ({ data }) => {
    try {
      const fileExt = data.fileName.split(".").pop();
      const fileName = `${data.userId}/${Date.now()}.${fileExt}`;

      await supabase.storage.from("avatars").upload(fileName, data.file, {
        cacheControl: "3600",
        upsert: true,
      });

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  });

// test from backend branch
