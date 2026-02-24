import { CreatePostForm } from "@/components/CreatePostForm";
import { SubNavbar } from "@/components/SubNavbar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Post } from "@/db/schema";
import type { SubNavPage } from "@/lib/types/subnavbar";
import { cn } from "@/lib/utils";
import { getServerAllPosts } from "@/server/posts";
import { getServerUser } from "@/server/user";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRightToLine, ChevronDown, ChevronUp } from "lucide-react";

export const Route = createFileRoute("/forums/")({
  component: RouteComponent,
  loader: async () => {
    return getServerAllPosts();
  },
});

const pages: SubNavPage[] = [
  { title: "All Threads", active: true },
  { title: "Forum Index", active: false },
];

function RouteComponent() {
  const posts = Route.useLoaderData();
  return (
    <div>
      <SubNavbar pages={pages} />
      <div className="min-h-screen bg-charcoal p-8">
        <FilterSection />
        <ThreadPage posts={posts} />
      </div>
      <CreatePostForm />
    </div>
  );
}

const ThreadPage = ({ posts }: { posts: Post[] }) => {
  return (
    <div className="mt-8">
      {posts.map((post) => (
        <ThreadItem key={post.id} thread={post} />
      ))}
    </div>
  );
};

// TODO: add thread type
const ThreadItem = async ({ thread }: { thread: Post }) => {
  const getServerUserFn = useServerFn(getServerUser);
  const user = await getServerUserFn({ data: { id: thread.authorId } });
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

const FilterSection = () => {
  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-4">
        <label className="text-xs font-bold text-cream">SORT BY: </label>
        <Select>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Last replied" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="last-replied">Last replied</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="top">Top</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4">
        <Command className="shadow-md mx-auto rounded-xs border-none bg-sage placeholder:text-zinc-100 text-zinc-100 placeholder:text-sm text-sm focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent relative overflow-visible">
          <CommandInput placeholder="Search..." className="border-none" />
        </Command>
        <Button variant="accent">Start Thread</Button>
      </div>
    </div>
  );
};
