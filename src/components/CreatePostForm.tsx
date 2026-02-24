import { useState } from "react";
import { createServerPost } from "@/server/posts";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export const CreatePostForm = () => {
  const { data: session } = authClient.useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      alert("You must be logged in to create a post");
      return;
    }

    setIsSubmitting(true);
    try {
      await createServerPost({
        data: {
          title,
          content,
          authorId: session.user.id,
        },
      });

      // Reset form
      setTitle("");
      setContent("");
      alert("Post created successfully!");
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session?.user) {
    return <p>Please log in to create a post</p>;
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
          className="w-full min-h-[200px] p-2 border rounded"
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Post"}
      </Button>
    </form>
  );
};
