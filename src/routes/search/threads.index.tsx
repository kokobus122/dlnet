import { getFilteredPosts } from "@/server/posts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const sortByFilters = ["hot", "last-replied", "new", "top"] as const;
export type sortByFilters = (typeof sortByFilters)[number];

export const threadFiltersSchema = z.object({
  query: z.string().optional().default(""),
  sortBy: z.array(z.enum(sortByFilters)).optional().default([]),
});

type ThreadFilters = z.infer<typeof threadFiltersSchema>;

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

  return (
    <div className="min-h-screen bg-charcoal p-8">
      <h1 className="text-cream text-2xl font-bold mb-4">Search Results</h1>
      <p className="text-sage mb-6">
        Query: "{query}"{" "}
        {sortBy.length > 0 && `| Sort By: ${sortBy.join(", ")}`}
      </p>

      {posts.length === 0 ? (
        <p className="text-sage">No posts found matching your search.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="bg-forest border border-sage p-4 rounded"
            >
              <h2 className="text-cream font-bold">{post.title}</h2>
              {post.content && (
                <p className="text-sage text-sm mt-2">{post.content}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
