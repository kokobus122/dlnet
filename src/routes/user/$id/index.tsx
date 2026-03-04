import { NavSearch } from "@/components/NavSearch";
import { SafeRichText } from "@/components/SafeRichText";
import { SubNavbar } from "@/components/SubNavbar";
import { Button } from "@/components/ui/button";
import type { Comment, Post } from "@/db/schema";
import type { SubNavPage } from "@/lib/types/subnavbar";
import { formatParam } from "@/lib/utils";
import { getUserComments, getUserPosts } from "@/server/posts";
import { getServerUser } from "@/server/user";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Suspense, useState } from "react";

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

  const [subnavPage, setSubnavPage] = useState<number>(1);

  const { data: userPosts } = useSuspenseQuery({
    queryKey: ["user-posts", paramId],
    queryFn: async () => {
      const posts = await getUserPosts({ data: { authorId: paramId } });
      return posts;
    },
  });
  const { data: userComments } = useSuspenseQuery({
    queryKey: ["user-comments", paramId],
    queryFn: async () => {
      const comments = await getUserComments({ data: { authorId: paramId } });
      return comments;
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
              <p>
                Last post:{" "}
                {userPosts && userPosts.length > 0
                  ? formatDate(userPosts[0].createdAt)
                  : "Never"}
              </p>
              <p>Posts: {userPosts?.length || 0}</p>
            </div>
          </div>
        </div>
        <Button variant="accent">Send Message</Button>
      </section>
      <SubNavbar
        pages={pages}
        setPage={setSubnavPage}
        activePage={subnavPage}
      />
      <section className="p-6">
        {subnavPage === 1 && userPosts && userPosts.length > 0 && (
          <Suspense fallback={<div>Loading posts...</div>}>
            {userPosts && userPosts.length > 0 ? (
              userPosts
                .slice()
                .reverse()
                .map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div>No posts available.</div> // Handle empty posts
            )}
          </Suspense>
        )}
        {subnavPage === 2 && userComments && userComments.length > 0 && (
          <Suspense fallback={<div>Loading comments...</div>}>
            {userComments && userComments.length > 0 ? (
              userComments
                .slice()
                .reverse()
                .map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))
            ) : (
              <div>No comments available.</div> // Handle empty comments
            )}
          </Suspense>
        )}
      </section>
    </div>
  );
}

const PostCard = ({ post }: { post: Post }) => {
  return (
    <Link
      to="/thread/$id/$title"
      params={{ id: String(post.id), title: formatParam(post.title) }}
      className="flex flex-col my-4 bg-sage px-4 py-2 text-sm"
    >
      <h1 className="font-bold text-cream">{post.title}</h1>
      <SafeRichText content={post.content} className="my-2" />
      <span className="text-neutral-200 text-xs">
        posted{" "}
        {formatDistanceToNow(new Date(post.createdAt || ""), {
          addSuffix: true,
        }) || "no date"}
      </span>
    </Link>
  );
};

const CommentCard = ({ comment }: { comment: Comment }) => {
  return (
    <div className="flex flex-col my-4 bg-sage px-4 py-2 text-sm">
      <SafeRichText content={comment.content} className="my-2" />
      <span className="text-neutral-200 text-xs">
        commented{" "}
        {formatDistanceToNow(new Date(comment.createdAt || ""), {
          addSuffix: true,
        }) || "no date"}
      </span>
    </div>
  );
};

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
