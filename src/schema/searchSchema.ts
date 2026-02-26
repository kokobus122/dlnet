import { sortByFilters } from "@/lib/types/search-filter";
import z from "zod";

export const threadFiltersSchema = z.object({
  query: z.string().default(""),
  sortBy: z.array(z.enum(sortByFilters)).optional().default([]),
});

// sort filter
export const sortBySchema = z.object({
  sortBy: z.array(z.enum(sortByFilters)).optional().default([]),
});
