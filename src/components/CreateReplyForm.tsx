import type { Post } from "@/db/schema";
import { authClient } from "@/lib/auth-client";
import { createCommentReply, createPostComment } from "@/server/posts";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "./ui/button";

export const CreateReplyForm = ({
  specificThread,
  onDone,
}: {
  specificThread: Post;
  onDone: () => void;
}) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [commentContent, setCommentContent] = useState("");

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user) {
        throw new Error("You must be logged in to comment");
      }

      return createPostComment({
        data: {
          postId: specificThread.id,
          authorId: session.user.id,
          content: commentContent,
        },
      });
    },
    onSuccess: async () => {
      setCommentContent("");
      await router.invalidate();
      onDone();
    },
  });

  const handleSubmitComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    commentMutation.mutate();
  };
  return (
    <>
      {session?.user ? (
        <form onSubmit={handleSubmitComment} className="mt-4 space-y-3">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            className="w-full min-h-24 p-2 border rounded bg-charcoal/60 border-sage"
            placeholder="Write a comment..."
            required
          />
          <Button
            type="submit"
            disabled={commentMutation.isPending}
            variant="accent"
          >
            {commentMutation.isPending ? "Posting..." : "Reply"}
          </Button>
        </form>
      ) : (
        <p className="text-xs text-neutral-400 mt-4">
          Log in to add a comment.
        </p>
      )}
    </>
  );
};

export const CreateCommentReplyForm = ({
  specificThread,
  parentCommentId,
  onDone,
}: {
  specificThread: Post;
  parentCommentId: number;
  onDone: () => void;
}) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [commentContent, setCommentContent] = useState("");

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user) {
        throw new Error("You must be logged in to comment");
      }

      return createCommentReply({
        data: {
          postId: specificThread.id,
          parentCommentId: parentCommentId,
          authorId: session.user.id,
          content: commentContent,
        },
      });
    },
    onSuccess: async () => {
      setCommentContent("");
      await router.invalidate();
      onDone();
    },
  });

  const handleSubmitComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    commentMutation.mutate();
  };
  return (
    <>
      {session?.user ? (
        <form onSubmit={handleSubmitComment} className="mt-4 space-y-3">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            className="w-full min-h-24 p-2 border rounded bg-charcoal/60 border-sage"
            placeholder="Write a comment..."
            required
          />
          <button
            type="submit"
            disabled={commentMutation.isPending}
            className="px-4 py-2 bg-forest border border-sage rounded hover:bg-sage/20 disabled:opacity-60"
          >
            {commentMutation.isPending ? "Posting..." : "Post comment"}
          </button>
        </form>
      ) : (
        <p className="text-xs text-neutral-400 mt-4">
          Log in to add a comment.
        </p>
      )}
    </>
  );
};