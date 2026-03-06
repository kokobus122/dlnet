import { formatMatchTitle } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

type MatchWithTeams = {
  id: number;
  scoreA: number;
  scoreB: number;
  matchDate: Date;
  teamARef: { id: number; name: string } | null;
  teamBRef: { id: number; name: string } | null;
};

export const UpcomingMatches = ({ matches }: { matches: MatchWithTeams[] }) => {
  return (
    <section>
      <h2 className="text-cream font-bold text-xs uppercase my-2">
        Upcoming matches
      </h2>
      {matches.length > 0 ? (
        matches.map((match) => {
          const teamAName = match.teamARef?.name ?? "TBD";
          const teamBName = match.teamBRef?.name ?? "TBD";

          return (
            <Link
              to="/$matchId/$matchTitle"
              params={{
                matchId: String(match.id),
                matchTitle: formatMatchTitle(teamAName, teamBName),
              }}
              key={match.id}
              className="flex justify-between gap-4 text-xs bg-forest hover:bg-forest/70 border-b border-sage px-4 py-2"
            >
              <div className="flex-1">
                <div className="flex justify-between gap-4">
                  <div className="flex flex-col text-neutral-200 gap-1 min-w-fit">
                    <h1 className="font-bold">{teamAName}</h1>
                    <h1 className="font-bold">{teamBName}</h1>
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
          );
        })
      ) : (
        <div>No upcoming matches.</div>
      )}
    </section>
  );
};
