import { ThreadSidebar } from "@/components/ThreadSidebar";
import { Separator } from "@/components/ui/separator";
import type { Match, Team } from "@/db/schema";
import {
  getMatchById,
  getTeamActiveRoster,
  getTeamsByMatchId,
} from "@/server/matches";
import { getServerAllPosts } from "@/server/posts";
import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

type TeamRoster = Awaited<ReturnType<typeof getTeamActiveRoster>>;
type TeamRosterEntry = TeamRoster[number];
type DisplayLineupPlayer = {
  id: string;
  country: string;
  ingameName: string;
  name: string;
};

type MatchRosters = {
  teamA: TeamRoster;
  teamB: TeamRoster;
};

export const Route = createFileRoute("/$matchId/$matchTitle/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { matchId } = params;
    const posts = await getServerAllPosts();
    const teams = await getTeamsByMatchId({
      data: { matchId: Number(matchId) },
    });

    const match = await getMatchById({ data: { matchId: Number(matchId) } });

    const [teamA, teamB] = await Promise.all([
      getTeamActiveRoster({ data: { teamId: teams.teamA.id } }),
      getTeamActiveRoster({ data: { teamId: teams.teamB.id } }),
    ]);

    const rosters: MatchRosters = { teamA, teamB };
    return { posts, teams, match, rosters };
  },
});

function RouteComponent() {
  const { posts, teams, match, rosters } = Route.useLoaderData();
  return (
    <div className="grid min-h-screen grid-cols-1 gap-4 bg-charcoal p-4 lg:grid-cols-[minmax(10.5rem,1fr)_minmax(0,2.3fr)_minmax(12rem,1.2fr)_minmax(10.5rem,1fr)]">
      <ThreadSidebar posts={posts} className="hidden lg:inline" />
      <MatchInfo teams={teams} match={match} rosters={rosters} />
    </div>
  );
}

const MatchInfo = ({
  match,
  teams,
  rosters,
}: {
  match: Match;
  teams: { teamA: Team; teamB: Team };
  rosters: MatchRosters;
}) => {
  const { teamA, teamB } = teams;
  return (
    <div className="bg-white/10 h-fit p-8 lg:col-span-2">
      <div className="flex justify-between">
        <p>EVENT</p>
        <div>
          <p className="text-sm text-gray-400">Friday, March 6</p>
          <p className="text-sm text-gray-400">7:00 PM CET</p>
        </div>
      </div>
      <div className="flex items-center justify-between my-12 gap-8 w-full lg:gap-12">
        <div className="flex items-center gap-4 flex-1">
          <h2 className="font-extrabold text-xl">{teamA.name}</h2>
          <img src={teamA.logo} alt={teamA.name} className="w-20 h-20" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="text-cream text-sm font-bold">
            {formatDistanceToNow(match.matchDate)}
          </p>
          <Separator className="text-gray-500" />
          <p className="text-gray-400 text-xs">B03</p>
        </div>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <img src={teamB.logo} alt={teamB.name} className="w-20 h-20" />
          <h2 className="font-extrabold text-xl">{teamB.name}</h2>
        </div>
      </div>

      <Lineups rosters={rosters} />
    </div>
  );
};

const Lineups = ({ rosters }: { rosters: MatchRosters }) => {
  const { teamA, teamB } = rosters;
  const teamALineup = buildLineup(teamA, "teamA");
  const teamBLineup = buildLineup(teamB, "teamB");

  return (
    <div className="bg-white/10 h-fit p-8">
      <h2 className="font-bold text-lg mb-4">Lineups</h2>
      {teamALineup.length > 0 && teamBLineup.length > 0 ? (
        <div className="flex gap-8">
          <div className="flex flex-col gap-2 flex-1">
            {teamALineup.map((player) => (
              <div key={player.id} className="flex items-center gap-4">
                <p>
                  {getCountryEmoji(player.country)} {player.ingameName}
                </p>
                <p className="text-xs text-gray-400">({player.name})</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {teamBLineup.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-4 justify-end"
              >
                <p>
                  {getCountryEmoji(player.country)} {player.ingameName}
                </p>
                <p className="text-xs text-gray-400">({player.name})</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-400">Lineup information not available.</p>
      )}
    </div>
  );
};

function buildLineup(roster: TeamRoster, side: "teamA" | "teamB") {
  const lineup: DisplayLineupPlayer[] = roster.map(
    (entry: TeamRosterEntry) => ({
      id: `${side}-${entry.id}`,
      country: entry.player.country,
      ingameName: entry.player.ingameName,
      name: entry.player.name,
    }),
  );

  const placeholdersToAdd = Math.max(0, 5 - lineup.length);
  for (let index = 0; index < placeholdersToAdd; index += 1) {
    lineup.push({
      id: `${side}-placeholder-${index}`,
      country: "EU",
      ingameName: "TBD",
      name: "TBD",
    });
  }

  return lineup.slice(0, 5);
}

function getCountryEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
