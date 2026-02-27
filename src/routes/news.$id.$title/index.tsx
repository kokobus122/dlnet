import { Error as ErrorComponent } from "@/components/Error";
import { NewsSidebar } from "@/components/NewsSidebar";
import { ThreadSidebar } from "@/components/ThreadSidebar";
import type { News, NewsWithOptionalComments } from "@/db/schema";
import { getAllNews, getSpecificNews } from "@/server/news";
import { getServerAllPosts } from "@/server/posts";
import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

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

  return (
    <div className="flex flex-wrap gap-4 bg-charcoal p-4 min-h-screen">
      <ThreadSidebar posts={posts} />
      <section className="w-full lg:w-[60%] bg-white/10 p-4">
        <h1 className="text-cream font-black text-3xl">{specificNews.title}</h1>
        <span className="text-neutral-300 text-xs">
          {formatDistanceToNow(new Date(specificNews.createdAt || ""), {
            addSuffix: true,
          }) || "no date"}
        </span>
        <p className="text-neutral-200 mt-4">{specificNews.content}</p>
        {specificNews.imageCover && (
          <article>
            <img
              src={specificNews.imageCover}
              alt={specificNews.title}
              className="w-full h-64 object-cover mt-4"
            />
            <span className="text-xs text-neutral-300 text-center">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Excepturi, architecto?
            </span>
          </article>
        )}
      </section>
      <NewsSidebar news={news} />
      {/* todo: add commments */}
      {specificNews.comment && specificNews.comment.length > 0 && (
        <section className="w-full lg:w-[60%] bg-white/10 p-4 mt-4">
          <h2 className="text-cream font-bold text-xl mb-4">Comments</h2>
          {specificNews.comment.map((comment) => (
            <div
              key={comment.id}
              className="border-t border-sage py-2 flex flex-col gap-1"
            >
              <span className="text-sm text-neutral-300">
                User {comment.authorId} commented{" "}
                {formatDistanceToNow(new Date(comment.createdAt || ""), {
                  addSuffix: true,
                }) || "no date"}
              </span>
              <p className="text-neutral-200">{comment.content}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
