import { useState } from "react";
import { createServerPost } from "@/server/posts";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { router } from "better-auth/api";

export const CreatePostForm = () => {
  const { data: session, isPending } = authClient.useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!session?.user) {
        throw new Error("You must be logged in to create a post");
      }
      const result = await createServerPost({
        data: {
          title,
          content,
          authorId: session.user.id,
        },
      });
      return result;
    },
    onSuccess: () => {
      // Reset form
      setTitle("");
      setContent("");
      router.navigate({ to: "/forums" });
    },
    onError: (error: Error) => {
      console.error("Failed to create post:", error);
    },
  });

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user) {
      console.error("You must be logged in to create a post");
      return;
    }

    mutation.mutate(); // Call the mutation here
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-800 dark:border-t-neutral-100" />
      </div>
    );
  }

  if (!session?.user) {
    console.log("not logged in");
    return;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-50 p-2 border rounded"
          required
        />
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create Post"}
      </Button>
    </form>
  );
};
