import { ThreadSidebar } from "@/components/ThreadSidebar";
import type { News } from "@/db/schema";
import { getAllNews } from "@/server/news";
import { getServerAllPosts } from "@/server/posts";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";

export const Route = createFileRoute("/")({
  component: App,
  loader: async () => {
    // loading data instantly on the server so no loading state is needed on the client
    const news = await getAllNews();
    const posts = await getServerAllPosts();
    return { news, posts };
  },
});

function App() {
  const { news, posts } = Route.useLoaderData();

  return (
    <div className="flex flex-wrap gap-4 bg-charcoal p-4 min-h-screen">
      <ThreadSidebar posts={posts} />
      <section className="min-w-0 space-y-6 lg:col-start-2">
        {news.find((n) => n.imageCover) && (
          <NewsHeader news={news.find((n) => n.imageCover)!} />
        )}
        {Object.entries(
          news.reduce(
            (acc, news) => {
              if (news.imageCover) return acc;
              const date = news.createdAt
                ? format(news.createdAt, "MMMM d")
                : "No date";
              if (!acc[date]) acc[date] = [];
              acc[date].push(news);
              return acc;
            },
            {} as Record<string, News[]>,
          ),
        ).map(([date, newsGroup]) => (
          <div key={date} className="space-y-1">
            <h2 className="font-bold text-cream">{date}</h2>
            {newsGroup.map((news, index) => (
              <NewsItem key={index} news={news} />
            ))}
          </div>
        ))}
      </section>
      <section>
        <h2 className="text-cream font-bold text-xs uppercase my-2">
          Upcoming matches
        </h2>
      </section>
      <section>
        <h2 className="text-cream font-bold text-xs uppercase my-2">
          Ongoing events
        </h2>
      </section>
    </div>
  );
}

const NewsHeader = ({ news }: { news: News }) => {
  return (
    <div className="bg-forest p-4 relative h-48 overflow-hidden">
      <img
        src={news.imageCover}
        alt={news.title}
        className="absolute inset-0 w-full h-full object-cover brightness-70"
      />
      <h1 className="text-zinc-200 font-black text-lg absolute bottom-4 left-4 right-4 z-10">
        {news.title}
      </h1>
    </div>
  );
};

const NewsItem = ({ news }: { news: News }) => {
  return (
    <Link
      to="/$id/$news"
      params={{
        id: String(news.id),
        news: news.title.replace(/\s+/g, "-").toLowerCase(),
      }}
    >
      <div className="flex justify-between items-center bg-forest border-t border-sage text-sm px-4 py-2">
        <div className="flex items-center">
          <span className="text-xs my-auto mr-6">1</span>
          <h1 className="text-cream font-bold text-md">{news.title}</h1>
        </div>
        <div className="flex items-center gap-2 text-end ml-2">
          <span className="text-xs">0</span>
        </div>
      </div>
    </Link>
  );
};
