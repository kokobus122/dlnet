import { SubNavbar } from "@/components/SubNavbar";
import { ThreadSearch } from "@/components/ThreadSearch";
import type { Post } from "@/db/schema";
import type { SubNavPage } from "@/lib/types/subnavbar";
import { cn } from "@/lib/utils";
import { getServerAllPosts } from "@/server/posts";
import { getServerUser } from "@/server/user";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightToLine, ChevronDown, ChevronUp } from "lucide-react";
import { Suspense } from "react";

export const Route = createFileRoute("/forums/")({
  component: RouteComponent,
});

const pages: SubNavPage[] = [
  { title: "All Threads", active: true },
  { title: "Forum Index", active: false },
];

function RouteComponent() {
  return (
    <div>
      <SubNavbar pages={pages} />
      <div className="min-h-screen bg-charcoal p-8">
        <ThreadSearch />
        <Suspense
          fallback={
            <div className="mt-8 text-sm text-cream">Loading threads...</div>
          }
        >
          <ThreadPage />
        </Suspense>
      </div>
    </div>
  );
}

const ThreadPage = () => {
  const { data: posts } = useSuspenseQuery({
    queryKey: ["all-posts"],
    queryFn: () => getServerAllPosts(),
  });
  return (
    <div className="mt-8">
      {posts.map((post) => (
        <ThreadItem key={post.id} thread={post} />
      ))}
    </div>
  );
};

// TODO: add thread type
const ThreadItem = ({ thread }: { thread: Post }) => {
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
          <span>posted & ago</span>
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


