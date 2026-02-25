import type { Post } from "@/db/schema";

export const PostCard = ({ post }: { post: Post }) => {
  return (
    <div className="flex justify-between items-center my-4 bg-sage px-4 py-2 text-sm">
      <div>
        <h1 className="font-bold">{post.title}</h1>
        <p className="my-2">{post.content}</p>
      </div>
      <span>
        posted{" "}
        {post.createdAt
          ? new Date(post.createdAt).toLocaleDateString()
          : "Unknown"}
      </span>
    </div>
  );
};
