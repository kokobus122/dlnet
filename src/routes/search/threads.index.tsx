import { AdvancedSearch } from "@/components/AdvancedSearch";
import type { Post } from "@/db/schema";
import { threadFiltersSchema } from "@/schema/searchSchema";
import { getFilteredPosts } from "@/server/posts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ThreadItem, type ForumThreadRow } from "../forums";
import type { ThreadFilters } from "@/lib/types/search-filter";

export const Route = createFileRoute("/search/threads/")({
  component: RouteComponent,
  validateSearch: (search): ThreadFilters => {
    return threadFiltersSchema.parse(search);
  },
});

function RouteComponent() {
  const searchParams = Route.useSearch();

  const { data: posts } = useSuspenseQuery({
    queryKey: ["filtered-posts", searchParams],
    queryFn: async () => {
      return await getFilteredPosts({
        data: { query: searchParams.query, sortBy: searchParams.sortBy },
      });
    },
  });

  const { query, sortBy } = searchParams;
  const threadRows: ForumThreadRow[] = posts.map((post) => ({
    thread: post,
    authorName: "Unknown user",
    latestReplyUserName: "Unknown user",
    latestActivityAt: post.createdAt ?? null,
    latestActivityType: "posted",
  }));

  return (
    <div className="min-h-screen bg-charcoal p-8">
      <AdvancedSearch />
      <p className="text-sage mb-6">
        Query: "{query}"{" "}
        {sortBy.length > 0 && `| Sort By: ${sortBy.join(", ")}`}
      </p>

      {posts.length === 0 ? (
        <p className="text-sage">No posts found matching your search.</p>
      ) : (
        <div>
          {threadRows.map((row) => (
            <ThreadItem key={row.thread.id} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}
