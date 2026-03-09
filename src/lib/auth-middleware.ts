import { createMiddleware } from "@tanstack/react-start";
import { authClient } from "./auth-client";
import { HEADERS } from "@tanstack/react-start/server";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: HEADERS,
    },
  });
  return await next({
    context: {
      user: {
        id: session?.user.id,
        name: session?.user.name,
        image: session?.user.image,
      },
    },
  });
});

export const adminMiddleware = createMiddleware().server(async ({ next }) => {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: HEADERS,
    },
  });
  return await next({
    context: {
      user: {
        role: session?.user.role,
      },
    },
  });
});
