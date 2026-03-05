import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatParam(param: string) {
  const result = param
    .replace(/[^a-z0-9\s-]/gi, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/-+$/, "");
  return result || "nan";
}

export function formatMatchTitle(teamA: string, teamB: string) {
  return `${formatParam(teamA)}-vs-${formatParam(teamB)}`;
}
