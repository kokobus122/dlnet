import { adminMiddleware, authMiddleware } from "@/lib/auth-middleware";
import { createServerFn } from "@tanstack/react-start";

export const getUserRole = createServerFn({
  method: "GET",
})
  .middleware([adminMiddleware])
  .handler(async ({ context }) => {
    return context.user.role;
  });

export const getUserId = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context.user.id;
  });

export const isOwner = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.user.id;
    const ownerId = process.env.OWNER_ID;
    console.log(ownerId, userId);

    if (!userId || !ownerId) {
      return false;
    }

    return userId === ownerId;
  });
