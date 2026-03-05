import {
  CreateNewsCommentReplyForm,
  CreateNewsReplyForm,
} from "@/components/CreateReplyForm";
import { Error as ErrorComponent } from "@/components/Error";
import { NewsSidebar } from "@/components/NewsSidebar";
import { SafeRichText } from "@/components/SafeRichText";
import { ThreadSidebar } from "@/components/ThreadSidebar";
import { Button } from "@/components/ui/button";
import type { Comment, NewsWithComments } from "@/db/schema";
import type { ReplyTarget } from "@/lib/types/reply-target";
import { getAllNews, getSpecificNews } from "@/server/news";
import { getServerAllPosts } from "@/server/posts";
import { getServerUser } from "@/server/user";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import type { User } from "drizzle/schema";
import { Reply } from "lucide-react";
import { useState } from "react";
import { PLACEHOLDER_USER_URL } from "../__root";

export const Route = createFileRoute("/news/$id/$title/")({
  loader: async ({ params }) => {
    const newsId = Number(params.id);
    if (!Number.isInteger(newsId) || newsId <= 0) {
      throw new Error("Invalid news ID in route params");
    }

    const posts = await getServerAllPosts();
    const news = await getAllNews();
    const specificNews = await getSpecificNews({
      data: { id: newsId },
    });
    return { posts, news, specificNews };
  },
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorComponent error={error.message} />,
});

function RouteComponent() {
  const { posts, news } = Route.useLoaderData();
  let { specificNews } = Route.useLoaderData();

  if (!specificNews) {
    throw new Error("News item not found");
  }

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
      <section className="min-w-0 lg:col-span-2">
        <div className="bg-white/10 p-4 self-start">
          <h1 className="text-cream font-black text-3xl">
            {specificNews.title}
          </h1>
          <span className="text-neutral-300 text-xs">
            {formatDistanceToNow(new Date(specificNews.createdAt || ""), {
              addSuffix: true,
            }) || "no date"}
          </span>
          <SafeRichText
            content={specificNews.content}
            className="text-neutral-200 mt-4 text-md"
          />
          {specificNews.imageCover && (
            <article>
              <img
                src={specificNews.imageCover}
                alt={specificNews.title}
                className="w-full h-64 object-cover mt-4"
              />
            </article>
          )}
          <div className="flex justify-end mt-4">
            <Button
              onClick={() =>
                toggleReplyTarget({ type: "post", id: specificNews.id })
              }
              variant="ghost"
            >
              <Reply size={20} className="text-cream" />
            </Button>
          </div>
        </div>
        {replyTarget?.type === "post" && replyTarget.id === specificNews.id && (
          <CreateNewsReplyForm
            specificNews={specificNews}
            onDone={() => setReplyTarget(null)}
          />
        )}
        <NewsComments
          specificNews={specificNews}
          comments={specificNews.comment}
          replyTarget={replyTarget}
          onToggleReply={toggleReplyTarget}
          onDone={() => setReplyTarget(null)}
        />
      </section>
      <NewsSidebar news={news} className="hidden lg:inline" />
    </div>
  );
}

const NewsComments = ({
  comments,
  specificNews,
  replyTarget,
  onToggleReply,
  onDone,
}: {
  comments: Comment[];
  specificNews: NewsWithComments;
  replyTarget: ReplyTarget;
  onToggleReply: (next: { type: "post" | "comment"; id: number }) => void;
  onDone: () => void;
}) => {
  const topLevelComments = comments.filter(
    (comment) => !comment.parentCommentId,
  );

  if (topLevelComments.length === 0) {
    return (
      <p className="text-neutral-400 text-sm my-4 text-center">
        No replies yet.
      </p>
    );
  }

  return (
    <section className="min-w-0 my-4">
      <h2 className="text-cream font-bold text-xl mb-4">Comments</h2>
      {topLevelComments.map((comment) => (
        <NewsReply
          key={comment.id}
          comment={comment}
          allComments={comments}
          specificNews={specificNews}
          replyTarget={replyTarget}
          onToggleReply={onToggleReply}
          onDone={onDone}
        />
      ))}
    </section>
  );
};

const NewsReply = ({
  comment,
  allComments,
  specificNews,
  replyTarget,
  onToggleReply,
  onDone,
}: {
  comment: Comment;
  allComments: Comment[];
  specificNews: NewsWithComments;
  replyTarget: ReplyTarget;
  onToggleReply: (next: { type: "post" | "comment"; id: number }) => void;
  onDone: () => void;
}) => {
  const { data: author } = useSuspenseQuery<User>({
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

  const replies = allComments.filter(
    (item) => item.parentCommentId === comment.id,
  );

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
        <CreateNewsCommentReplyForm
          specificNews={specificNews}
          parentCommentId={comment.id}
          onDone={onDone}
        />
      )}

      {replies.length > 0 && (
        <div className="pl-8 border-l border-sage">
          {replies.map((reply) => (
            <NewsReply
              key={reply.id}
              comment={reply}
              allComments={allComments}
              specificNews={specificNews}
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
