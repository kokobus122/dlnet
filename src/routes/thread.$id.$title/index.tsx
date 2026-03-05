import {
  CreateCommentReplyForm,
  CreateReplyForm,
} from "@/components/CreateReplyForm";
import { Error as ErrorComponent } from "@/components/Error";
import { SafeRichText } from "@/components/SafeRichText";
import { ThreadSidebar } from "@/components/ThreadSidebar";
import type { Comment, Post } from "@/db/schema";
import {
  getReplyComments,
  getServerAllPosts,
  getServerPostById,
} from "@/server/posts";
import { getServerUser } from "@/server/user";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import type { User } from "drizzle/schema";
import { ChevronDown, ChevronUp, Reply } from "lucide-react";
import { useState } from "react";
import { PLACEHOLDER_USER_URL } from "../__root";
import type { ReplyTarget } from "@/lib/types/reply-target";

export const Route = createFileRoute("/thread/$id/$title/")({
  loader: async ({ params }) => {
    const threadId = Number(params.id);
    if (!Number.isInteger(threadId) || threadId <= 0) {
      throw new Error("Invalid thread ID in route params");
    }

    const posts = await getServerAllPosts();
    const specificThread = await getServerPostById({
      data: { id: threadId },
    });
    if (!specificThread) {
      throw new Error("Thread not found");
    }
    const author = await getServerUser({
      data: { id: specificThread.authorId },
    });
    return { posts, specificThread, author };
  },
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorComponent error={error.message} />,
});

function RouteComponent() {
  const { posts, specificThread, author } = Route.useLoaderData();
  
  const [replyTarget, setReplyTarget] = useState<ReplyTarget>(null);
  const toggleReplyTarget = (next: {
    type: "post" | "comment";
    id: number;
  }) => {
    setReplyTarget((current) =>
      current?.type === next.type && current.id === next.id ? null : next,
    );
  };

  return (
    <div className="grid min-h-screen grid-cols-1 gap-4 bg-charcoal p-4 lg:grid-cols-[minmax(10.5rem,1fr)_minmax(0,2.6fr)_minmax(10.5rem,1fr)_minmax(10.5rem,1fr)]">
      <ThreadSidebar posts={posts} className="hidden lg:inline" />
      <section className="min-w-0 lg:col-span-3">
        <div className="font-bold text-3xl bg-white/10 px-4 py-2">
          <div className="flex items-center gap-4">
            <aside className="flex flex-col items-center">
              <button aria-label="Upvote">
                <ChevronUp />
              </button>
              <span className="text-xs">0</span>
              <button aria-label="Downvote">
                <ChevronDown />
              </button>
            </aside>
            <h1>{specificThread.title}</h1>
          </div>
        </div>
        <Thread
          thread={specificThread}
          author={author}
          onReply={() =>
            toggleReplyTarget({ type: "post", id: specificThread.id })
          }
        />

        {replyTarget?.type === "post" &&
          replyTarget.id === specificThread.id && (
            <CreateReplyForm
              specificThread={specificThread}
              onDone={() => setReplyTarget(null)}
            />
          )}

        {specificThread.comment.length > 0 ? (
          <div className="space-y-2">
            {specificThread.comment
              .filter((comment) => !comment.parentCommentId)
              .map((comment, key) => (
                <div key={comment.id}>
                  <ThreadReply
                    comment={comment}
                    key={key}
                    specificThread={specificThread}
                    replyTarget={replyTarget}
                    onToggleReply={toggleReplyTarget}
                    onDone={() => setReplyTarget(null)}
                  />
                </div>
              ))}
          </div>
        ) : (
          <p className="text-neutral-400 text-sm my-4 text-center">
            No replies yet.
          </p>
        )}
      </section>
    </div>
  );
}

const Thread = ({
  thread,
  author,
  onReply,
}: {
  thread: Post;
  author: User;
  onReply: () => void;
}) => {
  return (
    <div className="w-full bg-white/10 my-4 text-xs">
      <Link
        to="/user/$id"
        params={{ id: author.id }}
        className="flex gap-2 bg-black/20 items-center py-2 px-4 font-bold"
      >
        <img
          className="w-6 h-6 rounded-full"
          src={author.image || PLACEHOLDER_USER_URL}
          alt="Author avatar"
        />
        <h2>{author.name}</h2>
      </Link>
      <div className="px-4 py-2 flex flex-col gap-2">
        <SafeRichText content={thread.content} />
        <div className="flex justify-between">
          <span className="text-neutral-400">
            posted{" "}
            {formatDistanceToNow(new Date(thread.createdAt || ""), {
              addSuffix: true,
            }) || "no date"}
          </span>
          <button
            onClick={onReply}
            className="flex items-center gap-1 text-cream hover:cursor-pointer"
          >
            <Reply size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ThreadReply = ({
  comment,
  specificThread,
  replyTarget,
  onToggleReply,
  onDone,
}: {
  comment: Comment;
  specificThread: Post;
  replyTarget:
    | { type: "post"; id: number }
    | { type: "comment"; id: number }
    | null;
  onToggleReply: (next: { type: "post" | "comment"; id: number }) => void;
  onDone: () => void;
}) => {
  const { data: replies } = useSuspenseQuery({
    queryKey: ["reply", comment.id],
    queryFn: async () => {
      const replies = await getReplyComments({
        data: { parentCommentId: comment.id },
      });
      return replies;
    },
  });
  const { data: author } = useSuspenseQuery({
    queryKey: ["user", comment.authorId],
    queryFn: async () => {
      const user = await getServerUser({
        data: { id: comment.authorId },
      });
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    },
  });
  return (
    <>
      <div className="w-full bg-white/10 my-4 text-xs">
        <Link
          to="/user/$id"
          params={{ id: author.id }}
          className="flex gap-2 bg-black/20 items-center py-2 px-4 font-bold"
        >
          <img
            className="w-6 h-6 rounded-full"
            src={author.image || PLACEHOLDER_USER_URL}
            alt="Author avatar"
          />
          <h2>{author.name}</h2>
        </Link>
        <div className="px-4 py-2 flex flex-col gap-2">
          <SafeRichText content={comment.content} />
          <div className="flex justify-between">
            <span className="text-neutral-400">
              posted{" "}
              {formatDistanceToNow(new Date(comment.createdAt || ""), {
                addSuffix: true,
              }) || "no date"}
            </span>
            <button
              onClick={() => onToggleReply({ type: "comment", id: comment.id })}
              className="flex items-center gap-1 text-cream hover:cursor-pointer"
            >
              <Reply size={20} />
            </button>
          </div>
        </div>
      </div>
      {replyTarget?.type === "comment" && replyTarget.id === comment.id && (
        <CreateCommentReplyForm
          specificThread={specificThread}
          parentCommentId={comment.id}
          onDone={onDone}
        />
      )}
      {replies.length > 0 && (
        <div className="pl-8 border-l border-sage">
          {replies.map((reply) => (
            <ThreadReply
              comment={reply}
              key={reply.id}
              specificThread={specificThread}
              replyTarget={replyTarget}
              onToggleReply={onToggleReply}
              onDone={onDone}
            />
          ))}
        </div>
      )}
    </>
  );
};
