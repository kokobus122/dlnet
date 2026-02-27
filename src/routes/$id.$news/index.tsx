import { Error as ErrorComponent } from "@/components/Error";
import { ThreadSidebar } from "@/components/ThreadSidebar";
import { getSpecificNews } from "@/server/news";
import { getServerAllPosts } from "@/server/posts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$id/$news/")({
  loader: async ({ params }) => {
    const newsId = Number(params.id);
    if (!Number.isInteger(newsId) || newsId <= 0) {
      throw new Error("Invalid news ID in route params");
    }

    const posts = await getServerAllPosts();
    const specificNews = await getSpecificNews({
      data: { id: newsId },
    });
    return { posts, specificNews };
  },
  component: RouteComponent,
  errorComponent: ({ error }) => (
    <ErrorComponent error={error.message} />
  ),
});

function RouteComponent() {
  const { posts, specificNews } = Route.useLoaderData();

  return (
    <div className="flex flex-wrap gap-4 bg-charcoal p-4 min-h-screen">
      <ThreadSidebar posts={posts} />
      <section>{specificNews.title}</section>
    </div>
  );
}
