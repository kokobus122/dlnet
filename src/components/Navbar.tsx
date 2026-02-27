import { authClient } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";
import { Menu, User } from "lucide-react";
import { NavSearch } from "./NavSearch";
import { ModeToggle } from "./ui/mode-toggle";

export const Navbar = () => {
  const { data: session, isPending } = authClient.useSession();
  return (
    <nav className="min-w-full bg-charcoal h-16 border-b border-forest overflow-visible">
      <div className="flex justify-between container mx-auto w-full h-full overflow-visible">
        <section className="flex overflow-visible">
          <div className="flex items-center gap-4 px-6 border-x border-forest overflow-visible">
            <Link to="/">
              <img
                src="/logo192.png"
                width={48}
                alt="logo deadlock"
                className="my-auto"
              />
            </Link>
            {/* <Input
              placeholder="Search..."
              className="rounded-none border-none bg-sage placeholder:text-zinc-100 text-zinc-100 placeholder:text-sm text-sm focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent"
            /> */}
            <div className="overflow-visible">
              <NavSearch />
            </div>
          </div>
          <Link
            to="/forums"
            className="flex items-center px-4 border-r border-forest text-cream text-xs h-full"
          >
            Forums
          </Link>
          <Link
            to="/matches"
            className="flex items-center px-4 border-r border-forest text-cream text-xs h-full"
          >
            Matches
          </Link>
          <Link
            to="/events"
            className="flex items-center px-4 border-r border-forest text-cream text-xs h-full"
          >
            Events
          </Link>
          <Link
            to="/rankings"
            className="flex items-center px-4 border-r border-forest text-cream text-xs h-full"
          >
            Rankings
          </Link>
          <Link
            to="/stats"
            className="flex items-center px-4 border-r border-forest text-cream text-xs h-full"
          >
            Stats
          </Link>
        </section>
        <section className="flex items-center gap-4 px-6">
          <ModeToggle />
          {isPending ? (
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-cream border-t-transparent" />
          ) : session?.user ? (
            <Link to="/user/$id" params={{ id: session.user.id }}>
              <User className="text-cream" />
            </Link>
          ) : null}
          <Menu className="text-cream" />
        </section>
      </div>
    </nav>
  );
};
