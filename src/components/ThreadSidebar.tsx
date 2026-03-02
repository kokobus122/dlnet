import type { Comment, Post } from "@/db/schema";
import { formatParam } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export type PostWithOptionalComments = Post & { comment?: Comment[] };

export const ThreadSidebar = ({
  posts,
  className,
}: {
  posts: PostWithOptionalComments[];
  className?: string;
}) => {
  return (
    <section className={className}>
      <h2 className="text-cream font-bold text-xs uppercase my-2">
        Recent discussion
      </h2>
      {posts.map((post) => (
        <SmallThreadItem thread={post} key={post.id} />
      ))}
    </section>
  );
};

const SmallThreadItem = ({ thread }: { thread: PostWithOptionalComments }) => {
  return (
    <Link
      to="/thread/$id/$title"
      params={{
        id: String(thread.id),
        title: formatParam(thread.title),
      }}
      className="flex w-full items-center justify-between bg-forest border-t border-sage px-3 py-2 text-xs"
    >
      <p>{thread.title}</p>
      <span className="text-neutral-400">{thread.comment?.length ?? 0}</span>
    </Link>
  );
};
