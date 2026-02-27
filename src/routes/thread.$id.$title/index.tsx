import { Error as ErrorComponent } from "@/components/Error";
import { NewsSidebar } from "@/components/NewsSidebar";
import { ThreadSidebar } from "@/components/ThreadSidebar";
import { getAllNews } from "@/server/news";
import { getServerAllPosts, getServerPostById } from "@/server/posts";
import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/thread/$id/$title/")({
  loader: async ({ params }) => {
    const threadId = Number(params.id);
    if (!Number.isInteger(threadId) || threadId <= 0) {
      throw new Error("Invalid thread ID in route params");
    }

    const posts = await getServerAllPosts();
    const news = await getAllNews();
    const specificThread = await getServerPostById({
      data: { id: threadId },
    });
    return { posts, news, specificThread };
  },
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorComponent error={error.message} />,
});

function RouteComponent() {
  const { posts, news, specificThread } = Route.useLoaderData();

  return (
    <div className="flex flex-wrap gap-4 bg-charcoal p-4 min-h-screen">
      <ThreadSidebar posts={posts} />
      <section className="w-full lg:w-[60%] bg-white/10 p-4">
        <h1 className="text-cream font-black text-3xl">{specificThread.title}</h1>
        <span className="text-neutral-300 text-xs">
          {formatDistanceToNow(new Date(specificThread.createdAt || ""), {
            addSuffix: true,
          }) || "no date"}
        </span>
        <p className="text-neutral-200 mt-4">
          {specificThread.content}
        </p>
      </section>
      <NewsSidebar news={news} />
    </div>
  );
}
