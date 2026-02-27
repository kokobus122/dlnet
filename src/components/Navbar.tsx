import { authClient } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";
import { Menu, User } from "lucide-react";
import { useState } from "react";
import { NavSearch } from "./NavSearch";
import { ModeToggle } from "./ui/mode-toggle";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const { data: session, isPending } = authClient.useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks: { href: string; label: string }[] = [
    { href: "/forums", label: "Forums" },
    { href: "/matches", label: "Matches" },
    { href: "/events", label: "Events" },
    { href: "/rankings", label: "Rankings" },
    { href: "/stats", label: "Stats" },
  ] as const;

  return (
    <nav className="min-w-full bg-charcoal border-b border-forest overflow-visible">
      <div className="flex justify-between container mx-auto w-full h-16 overflow-visible">
        <section className="flex min-w-0 overflow-visible">
          <div className="flex items-center gap-3 px-3 sm:px-6 border-x border-forest overflow-visible">
            <Link to="/">
              <img
                src="/logo192.png"
                width={48}
                alt="logo deadlock"
                className="my-auto"
              />
            </Link>
            <div className="hidden md:block overflow-visible">
              <NavSearch />
            </div>
          </div>
          <div className="hidden lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center px-4 border-r border-forest text-cream text-xs h-full"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>
        <section className="flex items-center gap-3 sm:gap-4 px-3 sm:px-6">
          <ModeToggle />
          {isPending ? (
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-cream border-t-transparent" />
          ) : session?.user ? (
            <Link to="/user/$id" params={{ id: session.user.id }}>
              <User className="text-cream" />
            </Link>
          ) : (
            <Link to="/demo/better-auth">
              <User className="text-cream" />
            </Link>
          )}
          <button
            type="button"
            className="lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <Menu className="text-cream" />
          </button>
        </section>
      </div>

      <div
        className={cn(
          "lg:hidden border-t border-forest",
          isMobileMenuOpen ? "block" : "hidden",
        )}
      >
        <div className="px-3 py-3 border-b border-forest md:hidden">
          <NavSearch />
        </div>
        <div className="flex flex-col">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3 border-b border-forest text-cream text-xs"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};
