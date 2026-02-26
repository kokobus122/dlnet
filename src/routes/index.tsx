import type { NewNews, News } from "@/db/schema";
import { cn } from "@/lib/utils";
import { getAllNews } from "@/server/news";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowRightToLine, ChevronDown, ChevronUp } from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const { data: news } = useSuspenseQuery({
    queryKey: ["news"],
    queryFn: () => getAllNews(),
  });

  return (
    <>
      {Object.entries(
        news.reduce(
          (acc, news) => {
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
        <div key={date}>
          <h2 className="font-bold text-cream">{date}</h2>
          {newsGroup.map((news, index) => (
            <NewsItem key={index} news={news} />
          ))}
        </div>
      ))}
    </>
  );
}

const NewsItem = ({ news }: { news: News }) => {
  return (
    <div className="flex justify-between items-center bg-forest border-t border-sage text-sm px-4 py-1">
      <div className={cn("flex items-center ")}>
        <span className="text-xs my-auto mr-6">1</span>
        <h1 className="text-cream font-bold text-md">{news.title}</h1>
      </div>
      <div className="flex items-center gap-2 text-end">
        <span className="text-xs">0</span>
      </div>
    </div>
  );
};
