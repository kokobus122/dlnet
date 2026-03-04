import type { Match } from "@/db/schema";
import { formatMatchTitle } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

export const UpcomingMatches = ({ matches }: { matches: Match[] }) => {
  return (
    <section>
      <h2 className="text-cream font-bold text-xs uppercase my-2">
        Upcoming matches
      </h2>
      {matches.length > 0 ? (
        matches.map((match) => (
          <Link
            to="/$matchId/$matchTitle"
            params={{
              matchId: String(match.id),
              matchTitle: formatMatchTitle(match.teamA, match.teamB),
            }}
            key={match.id}
            className="flex justify-between gap-4 text-xs bg-forest hover:bg-forest/70 border-b border-sage px-4 py-2"
          >
            <div className="flex-1">
              <div className="flex justify-between gap-4">
                <div className="flex flex-col text-neutral-200 gap-1 min-w-fit">
                  <h1 className="font-bold">{match.teamA}</h1>
                  <h1 className="font-bold">{match.teamB}</h1>
                </div>
                <div className="flex flex-col gap-1 text-right min-w-fit">
                  <span>{match.scoreA}</span>
                  <span>{match.scoreB}</span>
                </div>
              </div>
            </div>
            <div className="text-cream font-bold whitespace-nowrap">
              {formatDistanceToNow(new Date(match.matchDate)) || "no date"}
            </div>
          </Link>
        ))
      ) : (
        <div>No upcoming matches.</div>
      )}
    </section>
  );
};
