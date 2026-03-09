import { SubNavbar } from "@/components/SubNavbar";
import type { Event, Team } from "@/db/schema";
import { formatDateRange, formatPrizePool, getEventStatus } from "@/lib/event";
import type { SubNavPage } from "@/lib/types/subnavbar";
import { getEventById, getEventTeams } from "@/server/events";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/event/$id/$title/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const event = await getEventById({ data: { id: Number(params.id) } });
    const teams = await getEventTeams({ data: { eventId: Number(params.id) } });
    return { event, teams };
  },
});

function RouteComponent() {
  const { event, teams } = Route.useLoaderData();
  const pages: SubNavPage[] = [
    { title: "Overview", active: true },
    { title: "Matches", active: false },
    { title: "Teams", active: false },
    { title: "Stats", active: false },
  ];

  return (
    <>
      <EventHeader event={event} />
      <SubNavbar pages={pages} className="bg-charcoal/50" />
      <ParticipatingTeams teams={teams} />
    </>
  );
}

const ParticipatingTeams = ({ teams }: { teams: Team[] }) => {
  return (
    <>
      <h2 className="text-cream font-bold p-2">Participating Teams</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-sage flex flex-col items-center"
          >
            <div className="bg-black/20 w-full text-center px-4 py-2">
              <p className="text-sm font-semibold">{team.name}</p>
            </div>
            <img
              src={team.logo}
              alt={team.name}
              className="w-16 h-16 object-contain mb-2"
            />
          </div>
        ))}
      </div>
    </>
  );
};

const EventHeader = ({ event }: { event: Event }) => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const status = getEventStatus(startDate, endDate);
  return (
    <div className="bg-charcoal/50 p-8">
      <div className="flex gap-8">
        <img src={event.logo} alt={event.title} className="w-32 h-32" />
        <div>
          <h1 className="text-2xl font-black text-white">{event.title}</h1>
          <p className="text-gray-300 mb-6 text-sm">{event.description}</p>
          <div className="grid grid-cols-3 gap-8 text-xs">
            <div>
              <p className="text-gray-400">DATES</p>
              <p className="text-white font-semibold text-sm">
                {formatDateRange(startDate, endDate)} ({status})
              </p>
            </div>
            <div>
              <p className="text-gray-400">PRIZE</p>
              <p className="text-white font-semibold text-sm">
                {formatPrizePool(event.prizePool)}
              </p>
            </div>
            <div>
              <p className="text-gray-400">LOCATION</p>
              <p className="text-white font-semibold text-sm">
                {event.location}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
