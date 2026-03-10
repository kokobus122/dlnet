import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatParam(param: string | number | null | undefined) {
  const normalized = String(param ?? "");
  const result = normalized
    .replace(/[^a-z0-9\s-]/gi, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/-+$/, "");
  return result || "nan";
}

export function formatMatchTitle(
  teamA: string | number | null | undefined,
  teamB: string | number | null | undefined,
) {
  return `${formatParam(teamA)}-vs-${formatParam(teamB)}`;
}
