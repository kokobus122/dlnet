import type { SubNavPage } from "@/lib/types/subnavbar";
import { cn } from "@/lib/utils";

export const SubNavbar = ({
  pages,
  setPage,
  activePage,
}: {
  pages: SubNavPage[];
  setPage?: (index: number) => void;
  activePage?: number;
}) => {
  return (
    <nav className="w-full bg-sage border-t border-forest px-6 relative flex">
      {pages.map((page, index) => (
        <div
          onClick={() => setPage?.(index + 1)}
          key={index}
          className={cn(
            "font-bold py-4 px-6 border-l border-forest w-fit text-sm relative hover:bg-forest/30 hover:cursor-pointer",
            index === pages.length - 1 && "border-r",
          )}
        >
          <p>{page.title}</p>
          {activePage === index + 1 && (
            <span className="absolute -bottom-1.5 left-[calc(50%-5px)] bg-charcoal z-2 w-2.5 h-2.5 rotate-45"></span>
          )}
        </div>
      ))}
    </nav>
  );
};
