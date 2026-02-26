import { Link, useNavigate } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { useState } from "react";
import { Input } from "./ui/input";
import type { sortByFilters } from "@/lib/types/search-filter";

type ThreadSearchProps = {
  sortBy: sortByFilters;
  onSortByChange: (value: sortByFilters) => void;
};

export const ThreadSearch = ({ sortBy, onSortByChange }: ThreadSearchProps) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate(); // { from: "/forums/" }

  const handleOnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/search/threads",
      search: {
        query: search,
        sortBy: [sortBy],
      },
    });
    console.log("Search submitted:", search, "Sort by:", sortBy);
  };

  const handleOnSortChange = (value: string) => {
    const selectedSort = value as sortByFilters;
    onSortByChange(selectedSort);
  };

  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-4">
        <label className="text-xs font-bold text-cream">SORT BY: </label>
        <Select value={sortBy} onValueChange={handleOnSortChange}>
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
      <section className="flex gap-4">
        <form onSubmit={handleOnSubmit} className="flex items-center gap-4">
          <Input
            placeholder="Search threads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-shadow-md mx-auto rounded-xs border-none bg-sage placeholder:text-zinc-100 text-zinc-100 placeholder:text-sm text-sm focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent relative overflow-visible"
          />
        </form>
        <Link to="/create-thread">
          <Button variant="accent">Start Thread</Button>
        </Link>
      </section>
    </div>
  );
};
