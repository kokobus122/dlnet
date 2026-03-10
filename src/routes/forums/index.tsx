import { SubNavbar } from "@/components/SubNavbar";
import { ThreadSearch } from "@/components/ThreadSearch";
import type { SubNavPage } from "@/lib/types/subnavbar";
import { cn, formatParam } from "@/lib/utils";
import { getForumThreadsPage } from "@/server/posts";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightToLine, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { sortByFilters } from "@/lib/types/search-filter";
import type { PostWithOptionalComments } from "@/components/ThreadSidebar";

const PAGE_SIZE = 10;
const QUERY_STALE_TIME = 30_000;

const forumPageQueryOptions = (sortBy: sortByFilters, page: number) => ({
  queryKey: ["forums", sortBy, page, PAGE_SIZE],
  queryFn: () =>
    getForumThreadsPage({
      data: {
        sortBy,
        page,
        limit: PAGE_SIZE,
      },
    }),
});

export type ForumThreadRow = {
  thread: PostWithOptionalComments;
  authorName: string;
  latestReplyUserName: string;
  latestActivityAt: Date | null;
  latestActivityType: "posted" | "replied";
};

export const Route = createFileRoute("/forums/")({
  validateSearch: (search: Record<string, unknown>) => {
    const allowedSorts: sortByFilters[] = ["hot", "last-replied", "new", "top"];
    const requestedSort =
      typeof search.sortBy === "string"
        ? (search.sortBy as sortByFilters)
        : "last-replied";
    const page = Number(search.page);

    return {
      sortBy: allowedSorts.includes(requestedSort)
        ? requestedSort
        : "last-replied",
      page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    };
  },
  loaderDeps: ({ search }) => ({
    sortBy: search.sortBy,
    page: search.page,
  }),
  loader: async ({ context, deps }) => {
    return context.queryClient.ensureQueryData(
      forumPageQueryOptions(deps.sortBy, deps.page),
    );
  },
  component: RouteComponent,
});

const pages: SubNavPage[] = [
  { title: "All Threads", active: true },
  { title: "Forum Index", active: false },
];

function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const initialData = Route.useLoaderData();

  const { data, isPending } = useQuery({
    ...forumPageQueryOptions(search.sortBy, search.page),
    initialData,
    placeholderData: keepPreviousData,
    staleTime: QUERY_STALE_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const threadRows = data?.threadRows ?? [];
  const canGoNext = data?.hasMore ?? false;
  const isFirstPage = search.page <= 1;

  const handleSortByChange = (value: sortByFilters) => {
    navigate({
      to: "/forums",
      search: (prev) => ({
        ...prev,
        sortBy: value,
        page: 1,
      }),
    });
  };

  const goToPage = (page: number) => {
    navigate({
      to: "/forums",
      search: (prev) => ({
        ...prev,
        page,
      }),
    });
  };

  return (
    <div>
      <SubNavbar pages={pages} />
      <div className="min-h-screen bg-charcoal p-4 md:p-8">
        <ThreadSearch
          sortBy={search.sortBy}
          onSortByChange={handleSortByChange}
        />
        <ThreadPage threadRows={threadRows} />
        {/* pagination */}
        <div className="mt-8 flex justify-end items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(search.page - 1)}
            disabled={isFirstPage || isPending}
            className="px-3 py-1 bg-forest border border-sage rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {search.page}</span>
          <button
            type="button"
            onClick={() => goToPage(search.page + 1)}
            disabled={!canGoNext || isPending}
            className="px-3 py-1 bg-forest border border-sage rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

const ThreadPage = ({ threadRows }: { threadRows: ForumThreadRow[] }) => {
  return (
    <div className="mt-8">
      {threadRows.map((row) => (
        <ThreadItem key={row.thread.id} row={row} />
      ))}
    </div>
  );
};

// TODO: add thread type
export const ThreadItem = ({
  row,
  className,
}: {
  row: ForumThreadRow;
  className?: string;
}) => {
  const {
    thread,
    authorName,
    latestReplyUserName,
    latestActivityAt,
    latestActivityType,
  } = row;

  return (
    // thread.index === pages.length - 1 && "border-r"
    <Link
      to="/thread/$id/$title"
      params={{ id: String(thread.id), title: formatParam(thread.title) }}
      className={cn(
        "flex justify-between items-center bg-forest border-t border-sage text-sm px-4 py-1 hover:bg-forest/70",
        className,
      )}
    >
      <div className={cn("flex items-center ")}>
        <span className="text-xs my-auto mr-6">1</span>
        <div className="flex flex-col items-center max-w-6">
          <ChevronUp />
          <span className="text-xs">0</span>
          <ChevronDown />
        </div>
        <div className="text-xs ml-4">
          <h1 className="text-cream font-bold text-sm">{thread.title}</h1>
          <div className="hidden md:inline">
            <span>
              posted{" "}
              <span suppressHydrationWarning>
                {formatDistanceToNow(new Date(thread.createdAt || ""), {
                  addSuffix: true,
                }) || "no date"}
              </span>
            </span>
            <span> ⋅ </span>
            <span>by {authorName}</span>
          </div>
          <div className="text-xs flex md:hidden items-center gap-2">
            <span>
              {latestActivityType}{" "}
              <span suppressHydrationWarning>
                {formatDistanceToNow(new Date(latestActivityAt ?? ""), {
                  addSuffix: true,
                }) || "no date"}
              </span>{" "}
              by {latestReplyUserName}
            </span>
          </div>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 text-end">
        <div className="text-xs">
          <p>{latestReplyUserName}</p>
          <span>
            {latestActivityType}{" "}
            <span suppressHydrationWarning>
              {formatDistanceToNow(new Date(latestActivityAt ?? ""), {
                addSuffix: true,
              }) || "no date"}
            </span>
          </span>
        </div>
        <ArrowRightToLine size={16} />
      </div>
    </Link>
  );
};
