import { SubNavbar } from "@/components/SubNavbar";
import { ThreadSearch } from "@/components/ThreadSearch";
import type { Post } from "@/db/schema";
import type { SubNavPage } from "@/lib/types/subnavbar";
import { cn } from "@/lib/utils";
import { getSortedPosts } from "@/server/posts";
import { getServerUser } from "@/server/user";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightToLine, ChevronDown, ChevronUp } from "lucide-react";
import { Suspense, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { sortByFilters } from "@/lib/types/search-filter";

export const Route = createFileRoute("/forums/")({
  component: RouteComponent,
});

const pages: SubNavPage[] = [
  { title: "All Threads", active: true },
  { title: "Forum Index", active: false },
];

function RouteComponent() {
  const [sortBy, setSortBy] = useState<sortByFilters>("last-replied");

  return (
    <div>
      <SubNavbar pages={pages} />
      <div className="min-h-screen bg-charcoal p-8">
        <ThreadSearch sortBy={sortBy} onSortByChange={setSortBy} />
        <Suspense
          fallback={
            <div className="mt-8">
              {Array.from({ length: 5 }).map((_, index) => (
                <ThreadItemSkeleton key={index} />
              ))}
            </div>
          }
        >
          <ThreadPage sortBy={sortBy} />
        </Suspense>
      </div>
    </div>
  );
}

const ThreadPage = ({ sortBy }: { sortBy: sortByFilters }) => {
  const { data: posts } = useSuspenseQuery({
    queryKey: ["all-posts", sortBy],
    queryFn: () => getSortedPosts({ data: { sortBy: [sortBy] } }),
    
  });

  return (
    <div className="mt-8">
      {posts.map((post) => (
        <ThreadItem key={post.id} thread={post} />
      ))}
      <div className="mt-8 flex justify-end gap-2">
        {[1, 2, 3, 4].map((page) => (
          <button
            key={page}
            className="px-3 py-1 bg-forest border border-sage rounded hover:bg-sage/20 hover:cursor-pointer"
          >
            {page}
          </button>
        ))}
        <span>..</span>
        <button className="px-3 py-1 bg-forest border border-sage rounded hover:bg-sage/20 hover:cursor-pointer">
          {Math.ceil(posts.length / 2)}
        </button>
      </div>
    </div>
  );
};

// TODO: add thread type
export const ThreadItem = ({ thread }: { thread: Post }) => {
  const { data: user } = useSuspenseQuery({
    queryKey: ["user", thread.authorId],
    queryFn: () => getServerUser({ data: { id: thread.authorId } }),
  });

  // const getServerUserFn = useServerFn(getServerUser);
  // const user = await getServerUserFn({ data: { id: thread.authorId } });
  return (
    // thread.index === pages.length - 1 && "border-r"
    <div className="flex justify-between items-center bg-forest border-t border-sage text-sm px-4 py-1">
      <div className={cn("flex items-center ")}>
        <span className="text-xs my-auto mr-6">1</span>
        <div className="flex flex-col items-center max-w-6">
          <ChevronUp />
          <span className="text-xs">0</span>
          <ChevronDown />
        </div>
        <div className="text-xs ml-4">
          <h1 className="text-cream font-bold text-sm">{thread.title}</h1>
          <span>
            posted{" "}
            {formatDistanceToNow(new Date(thread.createdAt || ""), {
              addSuffix: true,
            }) || "no date"}
          </span>
          <span> ⋅ </span>
          <span>by {user.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-end">
        <div className="text-xs">
          <p>{user.name}</p>
          <span>posted & ago</span>
        </div>
        <ArrowRightToLine size={16} />
      </div>
    </div>
  );
};

const ThreadItemSkeleton = () => {
  return (
    <div className="flex justify-between items-center bg-forest border-t border-sage text-sm px-4 py-1 animate-pulse">
      <div className={cn("flex items-center ")}>
        <span className="h-3 w-3 rounded bg-sage/60 my-auto mr-6" />
        <div className="flex flex-col items-center max-w-6 gap-1">
          <span className="h-4 w-4 rounded bg-sage/60" />
          <span className="h-3 w-4 rounded bg-sage/60" />
          <span className="h-4 w-4 rounded bg-sage/60" />
        </div>
        <div className="text-xs ml-4 space-y-2">
          <div className="h-4 w-48 rounded bg-sage/60" />
          <div className="h-3 w-32 rounded bg-sage/60" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-end">
        <div className="text-xs space-y-2">
          <div className="h-3 w-16 rounded bg-sage/60" />
          <div className="h-3 w-20 rounded bg-sage/60" />
        </div>
        <span className="h-4 w-4 rounded bg-sage/60" />
      </div>
    </div>
  );
};
