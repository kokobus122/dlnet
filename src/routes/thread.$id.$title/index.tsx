import { Error as ErrorComponent } from "@/components/Error";
import { ThreadSidebar } from "@/components/ThreadSidebar";
import { getServerAllPosts, getServerPostById } from "@/server/posts";
import { getServerUser } from "@/server/user";
import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, Reply } from "lucide-react";

export const Route = createFileRoute("/thread/$id/$title/")({
  loader: async ({ params }) => {
    const threadId = Number(params.id);
    if (!Number.isInteger(threadId) || threadId <= 0) {
      throw new Error("Invalid thread ID in route params");
    }

    const posts = await getServerAllPosts();
    const specificThread = await getServerPostById({
      data: { id: threadId },
    });
    const author = await getServerUser({
      data: { id: specificThread.authorId },
    });
    return { posts, specificThread, author };
  },
  component: RouteComponent,
  errorComponent: ({ error }) => <ErrorComponent error={error.message} />,
});

function RouteComponent() {
  const { posts, specificThread, author } = Route.useLoaderData();

  return (
    <div className="flex flex-wrap gap-4 bg-charcoal p-4 min-h-screen">
      <ThreadSidebar posts={posts} />
      <section className="w-full lg:w-[80%]">
        <div className="font-bold text-3xl bg-white/10 px-4 py-2">
          <div className="flex items-center gap-4">
            <aside className="flex flex-col items-center">
              <button aria-label="Upvote">
                <ChevronUp />
              </button>
              <span className="text-xs">0</span>
              <button aria-label="Downvote">
                <ChevronDown />
              </button>
            </aside>
            <h1>{specificThread.title}</h1>
          </div>
        </div>
        <div className="w-full bg-white/10 my-4 text-xs">
          <div className="flex gap-2 bg-black/20 py-2 px-4 font-bold">
            {/* <img src={author.image || ""} alt="Author avatar" /> */}
            <h2 className="">{author.name}</h2>
          </div>
          <div className="px-4 py-2 flex flex-col gap-2">
            <p className="text-sm">{specificThread.content}</p>
            <div className="flex justify-between">
              <span className="text-neutral-400">
                posted{" "}
                {formatDistanceToNow(new Date(specificThread.createdAt || ""), {
                  addSuffix: true,
                }) || "no date"}
              </span>
              <Link to="">
                <Reply size={20} className="text-cream" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
