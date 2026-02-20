import { Link } from "@tanstack/react-router";
import { Input } from "./ui/input";
import { ModeToggle } from "./ui/mode-toggle";

const pages = ["forums", "matches", "events", "rankings", "stats"];

export const Navbar = () => {
  return (
    <nav className="min-w-full bg-charcoal h-16 border-b border-forest ">
      <div className="flex justify-between container h-full">
        <section className="flex mx-auto">
          <div className="flex items-center gap-4 px-6 border-x border-forest">
            <Link to="/">
              <img
                src="/logo.png"
                width={48}
                alt="logo deadlock"
                className="my-auto"
              />
            </Link>
            <Input
              placeholder="Search..."
              className="rounded-none border-none bg-sage placeholder:text-zinc-100 text-zinc-100 placeholder:text-sm text-sm focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent"
            />
          </div>
          {pages.map((page) => (
            <div key={page}>
              <a
                href={`/${page}`}
                className="flex items-center px-4 border-r border-forest text-cream text-sm h-full"
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </a>
            </div>
          ))}
        </section>
        <section className="flex items-center px-6">
          <ModeToggle />
        </section>
      </div>
    </nav>
  );
};
