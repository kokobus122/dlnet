import { NavSearch } from "@/components/NavSearch";
import { Button } from "@/components/ui/button";
import { getServerUser } from "@/server/user";
import { createFileRoute, redirect } from "@tanstack/react-router";

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

function RouteComponent() {
  const user = Route.useLoaderData();
  return (
    <div className="container mx-auto min-h-screen bg-charcoal">
      <section className="w-full bg-sage flex justify-between p-4">
        <div className="flex gap-4">
          <img
            src={user?.image || "/default-avatar.png"}
            alt="User avatar"
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <div className="text-neutral-200 italic">
              <p>
                Registered:{" "}
                {user?.createdAt ? formatDate(user.createdAt) : "Unknown"}
              </p>
              <p>Last post: Never</p>
              <p>Posts: 0</p>
            </div>
          </div>
        </div>
        <Button variant="accent">Send Message</Button>
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
