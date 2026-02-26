import type { sortBySchema, threadFiltersSchema } from "@/schema/searchSchema";
import type z from "zod";

// standard search
export const sortByFilters = ["hot", "last-replied", "new", "top"] as const;
export type sortByFilters = (typeof sortByFilters)[number];

// advanced search fields
export const fieldFilters = ["title-content", "title"] as const;
export type fieldFilters = (typeof fieldFilters)[number];

export type ThreadFilters = z.infer<typeof threadFiltersSchema>;
export type SortFilters = z.infer<typeof sortBySchema>;