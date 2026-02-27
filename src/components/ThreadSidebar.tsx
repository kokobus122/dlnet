import type { Post } from "@/db/schema";
import { Link } from "@tanstack/react-router";

export const ThreadSidebar = ({ posts }: { posts: Post[] }) => {
  return (
    <section>
      <h2 className="text-cream font-bold text-xs uppercase my-2">
        Recent discussion
      </h2>
      {posts.map((post) => (
        <SmallThreadItem thread={post} key={post.id} />
      ))}
    </section>
  );
};

const SmallThreadItem = ({ thread }: { thread: Post }) => {
  return (
    <Link
      to="/thread/$id/$title"
      params={{
        id: String(thread.id),
        title: thread.title.replace(/\s+/g, "-").toLowerCase(),
      }}
      className="flex justify-between w-42 items-center bg-forest border-t border-sage text-xs px-3 py-2"
    >
      <p>{thread.title}</p>
      <span className="text-neutral-400">0</span>
    </Link>
  );
};
