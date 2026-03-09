import { format } from "date-fns";

export function formatPrizePool(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateRange(startDate: Date, endDate: Date) {
  return `${format(startDate, "MMM d")}—${format(endDate, "MMM d")}`;
}

export function getEventStatus(startDate: Date, endDate: Date) {
  const now = new Date();

  if (now < startDate) {
    return "Upcoming";
  }

  if (now > endDate) {
    return "Completed";
  }

  return "Ongoing";
}

export function getRegionFlag(location: string) {
  const regionCode = location.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(regionCode)) {
    return "🌍";
  }

  const codePoints = regionCode
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}