import { NavSearch } from "@/components/NavSearch";
import { PostCard } from "@/components/PostCard";
import { SubNavbar } from "@/components/SubNavbar";
import { Button } from "@/components/ui/button";
import type { SubNavPage } from "@/lib/types/subnavbar";
import { getUserPosts } from "@/server/posts";
import { getServerUser } from "@/server/user";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/user/$id/")({
  component: RouteComponent,
  errorComponent: ({ error }) => {
    return <UserProfileError error={error} />;
  },
  beforeLoad: async ({ params }) => {
    const { id } = params;
    const user = await getServerUser({ data: { id } });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },
  loader: async ({ params }) => {
    const { id } = params;
    const user = await getServerUser({ data: { id } });
    return user;
  },
});

const pages: SubNavPage[] = [
  { title: "Posts", active: true },
  { title: "Comments", active: false },
];

function RouteComponent() {
  const user = Route.useLoaderData();
  const { id: paramId } = Route.useParams();
  const { data: userPosts } = useSuspenseQuery({
    queryKey: ["user-posts", paramId],
    queryFn: async () => {
      const posts = await getUserPosts({ data: { authorId: paramId } });
      return posts;
    },
  });
  return (
    <div className="min-h-screen bg-charcoal">
      <section className="w-full bg-sage flex justify-between p-4">
        <div className="flex gap-4">
          <img
            src={user?.image || "/default-avatar.png"}
            alt="User avatar"
            className="w-16 h-16 rounded-full"
          />
          <div className="text-sm">
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <div className="text-neutral-200 italic">
              <p>
                Registered:{" "}
                {user?.createdAt ? formatDate(user.createdAt) : "Unknown"}
              </p>
              <p>Last post: {userPosts && userPosts.length > 0 ? formatDate(userPosts[0].createdAt) : "Never"}</p>
              <p>Posts: {userPosts?.length || 0}</p>
            </div>
          </div>
        </div>
        <Button variant="accent">Send Message</Button>
      </section>
      <SubNavbar pages={pages} />
      <section className="p-6">
        <Suspense fallback={<div>Loading posts...</div>}>
          {userPosts && userPosts.length > 0 ? (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div>No posts available.</div> // Handle empty posts
          )}
        </Suspense>
      </section>
    </div>
  );
}

const UserProfileError = ({ error }: { error: unknown }) => {
  return (
    <div className="container mx-auto min-h-screen flex items-center justify-center">
      <div className="text-center mb-[20%]">
        <h1 className="text-3xl font-bold text-primary">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred."}
        </h1>
        <p className="text-zinc-400 my-2">
          Sorry! We couldn't find the page you were looking for. <br />
          Try your luck with a search?
        </p>
        <NavSearch />
      </div>
    </div>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
