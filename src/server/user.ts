import { db } from "@/db";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { user } from "drizzle/schema";

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

