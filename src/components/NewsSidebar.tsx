import type { News } from "@/db/schema";
import { formatParam } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export const NewsSidebar = ({ news }: { news: News[] }) => {
  return (
    <section>
      <h2 className="text-cream font-bold text-xs uppercase my-2">
        Recent news
      </h2>
      {news.map((item) => (
        <SmallNewsItem news={item} key={item.id} />
      ))}
    </section>
  );
};

const SmallNewsItem = ({ news }: { news: News }) => {
  return (
    <Link
      to="/news/$id/$title"
      params={{
        id: String(news.id),
        title: formatParam(news.title)
      }}
    >
      <div className="flex justify-between items-center bg-forest border-t border-sage text-xs px-3 py-2 w-42">
        <p className="line-clamp-1">{news.title}</p>
        <span className="text-neutral-400">0</span>
      </div>
    </Link>
  );
};
