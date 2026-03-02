import { SubNavbar } from "@/components/SubNavbar";
import { ThreadSearch } from "@/components/ThreadSearch";
import type { SubNavPage } from "@/lib/types/subnavbar";
import { cn, formatParam } from "@/lib/utils";
import { getSortedPosts } from "@/server/posts";
import { getServerUser } from "@/server/user";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightToLine, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import type { sortByFilters } from "@/lib/types/search-filter";
import type { PostWithOptionalComments } from "@/components/ThreadSidebar";

type ForumThreadRow = {
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

    return {
      sortBy: allowedSorts.includes(requestedSort)
        ? requestedSort
        : "last-replied",
    };
  },
  loaderDeps: ({ search }) => ({
    sortBy: search.sortBy,
  }),
  loader: async ({ deps }) => {
    const posts = await getSortedPosts({
      data: { sortBy: [deps.sortBy] },
    });

    const latestCommentByPost = new Map<
      number,
      NonNullable<PostWithOptionalComments["comment"]>[number]
    >();
    const userIds = new Set<string>();

    for (const post of posts) {
      userIds.add(post.authorId);

      if (post.comment && post.comment.length > 0) {
        const latestComment = post.comment.reduce((latest, current) => {
          const latestTime = new Date(latest.createdAt ?? 0).getTime();
          const currentTime = new Date(current.createdAt ?? 0).getTime();
          return currentTime > latestTime ? current : latest;
        });

        latestCommentByPost.set(post.id, latestComment);
        userIds.add(latestComment.authorId);
      }
    }

    const uniqueUserIds = Array.from(userIds);
    const users = await Promise.all(
      uniqueUserIds.map(async (id) => {
        const foundUser = await getServerUser({ data: { id } });
        return [id, foundUser?.name ?? "Unknown user"] as const;
      }),
    );

    const userNameById = new Map<string, string>(users);

    const threadRows: ForumThreadRow[] = posts.map((post) => {
      const latestComment = latestCommentByPost.get(post.id);

      return {
        thread: post,
        authorName: userNameById.get(post.authorId) ?? "Unknown user",
        latestReplyUserName:
          userNameById.get(latestComment?.authorId ?? post.authorId) ??
          "Unknown user",
        latestActivityAt: latestComment?.createdAt ?? post.createdAt ?? null,
        latestActivityType: latestComment ? "replied" : "posted",
      };
    });

    return {
      sortBy: deps.sortBy,
      threadRows,
    };
  },
  component: RouteComponent,
});

const pages: SubNavPage[] = [
  { title: "All Threads", active: true },
  { title: "Forum Index", active: false },
];

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { sortBy, threadRows } = Route.useLoaderData();

  const handleSortByChange = (value: sortByFilters) => {
    navigate({
      to: "/forums",
      search: (prev) => ({
        ...prev,
        sortBy: value,
      }),
    });
  };

  return (
    <div>
      <SubNavbar pages={pages} />
      <div className="min-h-screen bg-charcoal p-4 md:p-8">
        <ThreadSearch sortBy={sortBy} onSortByChange={handleSortByChange} />
        <ThreadPage threadRows={threadRows} />
      </div>
    </div>
  );
}

const ThreadPage = ({ threadRows }: { threadRows: ForumThreadRow[] }) => {
  const rows = useMemo(() => threadRows, [threadRows]);

  return (
    <div className="mt-8">
      {rows.map((row) => (
        <ThreadItem key={row.thread.id} row={row} />
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
          {Math.ceil(rows.length / 2)}
        </button>
      </div>
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
              {formatDistanceToNow(new Date(thread.createdAt || ""), {
                addSuffix: true,
              }) || "no date"}
            </span>
            <span> ⋅ </span>
            <span>by {authorName}</span>
          </div>
          <div className="text-xs flex md:hidden items-center gap-2">
            <span>
              {latestActivityType}{" "}
              {formatDistanceToNow(new Date(latestActivityAt ?? ""), {
                addSuffix: true,
              }) || "no date"}{" "}
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
            {formatDistanceToNow(new Date(latestActivityAt ?? ""), {
              addSuffix: true,
            }) || "no date"}
          </span>
        </div>
        <ArrowRightToLine size={16} />
      </div>
    </Link>
  );
};
