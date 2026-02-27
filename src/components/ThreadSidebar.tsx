import type { Post } from "@/db/schema";

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
    <div className="flex justify-between items-center bg-forest border-t border-sage text-xs px-3 py-2 w-42">
      <p>{thread.title}</p>
      <span className="text-neutral-400">0</span>
    </div>
  );
};
