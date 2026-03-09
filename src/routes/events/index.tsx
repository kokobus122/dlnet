import type { Event } from "@/db/schema";
import { formatDateRange, formatPrizePool, getEventStatus, getRegionFlag } from "@/lib/event";
import { formatParam } from "@/lib/utils";
import { getAllEvents } from "@/server/matches";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/events/")({
  component: RouteComponent,
  loader: async () => {
    const events = await getAllEvents();
    return { events };
  },
});

function RouteComponent() {
  const { events } = Route.useLoaderData();
  return (
    <>
      <div className="div grid md:grid-cols-2 gap-4 bg-charcoal p-4">
        <div className="flex flex-col">
          <h1 className="uppercase text-cream font-bold text-xs">
            Upcoming events
          </h1>
          <ul>
            {events.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col">
          <h1 className="uppercase text-cream font-bold text-xs">
            Completed events
          </h1>
          <ul>
            {events.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

const EventCard = ({ event }: { event: Event }) => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const status = getEventStatus(startDate, endDate);

  return (
    <Link
      to="/event/$id/$title"
      params={{ id: String(event.id), title: formatParam(event.title) }}
      className="overflow-hidden text-xs"
    >
      <div className="grid grid-cols-[1fr_5rem] md:grid-cols-[1fr_8.5rem] bg-forest">
        <div className="p-2">
          <h2 className="text-lg font-bold text-cream">{event.title}</h2>
          <div className="mt-5 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex flex-col gap-1">
              <p
                className={
                  status === "Ongoing" ? "text-destructive" : "text-cream"
                }
              >
                {status}
              </p>
              <p className="text-sage uppercase tracking-wide">Status</p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-cream">{formatPrizePool(event.prizePool)}</p>
              <p className="text-sage text-xs uppercase tracking-wide">
                Prize Pool
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-cream whitespace-nowrap">
                {formatDateRange(startDate, endDate)}
              </p>
              <p className="text-sage text-xs uppercase tracking-wide">Dates</p>
            </div>

            <div className="flex flex-col gap-1 text-right">
              <p className="text-cream">{getRegionFlag(event.location)}</p>
              <p className="text-sage text-xs uppercase tracking-wide">
                {event.location}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-white/10">
          <img
            src={event.logo}
            alt={event.title}
            className="h-14 w-14 object-contain p-2 md:h-24 md:w-24"
          />
        </div>
      </div>
    </Link>
  );
};


