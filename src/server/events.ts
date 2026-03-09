import { db } from "@/db";
import { events, eventTeams, matches, teams } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";

export const getEvents = createServerFn({
  method: "GET",
}).handler(async () => {
  const eventsList = await db.select().from(events);
  return eventsList;
});

export const getEventById = createServerFn({
  method: "GET",
})
  .inputValidator((data: { id: number }) => {
    if (typeof data.id !== "number" || data.id <= 0) {
      throw new Error("Invalid event ID");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const event = await db.query.events.findFirst({
      where: eq(events.id, data.id),
    });

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  });

export const getEventTeams = createServerFn({
  method: "GET",
})
  .inputValidator((data: { eventId: number }) => {
    if (typeof data.eventId !== "number" || data.eventId <= 0) {
      throw new Error("Invalid event ID");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const teamsList = await db
      .select()
      .from(teams)
      .innerJoin(eventTeams, eq(teams.id, eventTeams.teamId))
      .where(eq(eventTeams.eventId, data.eventId));

    return teamsList.map(({ teams }) => teams);
  });

export const createEvent = createServerFn({
  method: "POST",
})
  .inputValidator(
    (data: {
      title: string;
      description: string;
      logo: string;
      prizePool: number;
      location: string;
      startDate: string;
      endDate: string;
    }) => {
      if (typeof data.title !== "string" || data.title.trim().length === 0) {
        throw new Error("Event title is required");
      }
      if (
        typeof data.description !== "string" ||
        data.description.trim().length === 0
      ) {
        throw new Error("Event description is required");
      }
      if (typeof data.logo !== "string" || data.logo.trim().length === 0) {
        throw new Error("Event logo is required");
      }
      if (typeof data.prizePool !== "number" || data.prizePool < 0) {
        throw new Error("Prize pool must be a non-negative number");
      }
      if (
        typeof data.location !== "string" ||
        data.location.trim().length === 0
      ) {
        throw new Error("Location is required");
      }
      if (
        typeof data.startDate !== "string" ||
        data.startDate.trim().length === 0
      ) {
        throw new Error("Start date is required");
      }
      if (
        typeof data.endDate !== "string" ||
        data.endDate.trim().length === 0
      ) {
        throw new Error("End date is required");
      }

      return {
        title: data.title.trim(),
        description: data.description.trim(),
        logo: data.logo.trim(),
        prizePool: data.prizePool,
        location: data.location.trim(),
        startDate: new Date(data.startDate.trim()),
        endDate: new Date(data.endDate.trim()),
      };
    },
  )
  .handler(async ({ data }) => {
    const created = await db.insert(events).values(data).returning();
    return created[0];
  });

export const assignTeamToEvent = createServerFn({
  method: "POST",
})
  .inputValidator(
    (data: { eventId: number; teamId: number; seed?: number | null }) => {
      if (typeof data.eventId !== "number" || data.eventId <= 0) {
        throw new Error("Invalid event ID");
      }
      if (typeof data.teamId !== "number" || data.teamId <= 0) {
        throw new Error("Invalid team ID");
      }

      if (
        data.seed !== undefined &&
        data.seed !== null &&
        (typeof data.seed !== "number" || data.seed <= 0)
      ) {
        throw new Error("Seed must be a positive number");
      }

      return {
        eventId: data.eventId,
        teamId: data.teamId,
        seed: data.seed ?? null,
      };
    },
  )
  .handler(async ({ data }) => {
    const [eventExists, teamExists, existingAssignment] = await Promise.all([
      db.query.events.findFirst({
        where: eq(events.id, data.eventId),
        columns: { id: true },
      }),
      db.query.teams.findFirst({
        where: eq(teams.id, data.teamId),
        columns: { id: true },
      }),
      db.query.eventTeams.findFirst({
        where: and(
          eq(eventTeams.eventId, data.eventId),
          eq(eventTeams.teamId, data.teamId),
        ),
        columns: { id: true },
      }),
    ]);

    if (!eventExists) {
      throw new Error("Event does not exist");
    }

    if (!teamExists) {
      throw new Error("Team does not exist");
    }

    if (existingAssignment) {
      throw new Error("Team is already assigned to this event");
    }

    const created = await db.insert(eventTeams).values(data).returning();
    return created[0];
  });

export const assignMatchToEvent = createServerFn({
  method: "POST",
})
  .inputValidator((data: { eventId: number; matchId: number }) => {
    if (typeof data.eventId !== "number" || data.eventId <= 0) {
      throw new Error("Invalid event ID");
    }

    if (typeof data.matchId !== "number" || data.matchId <= 0) {
      throw new Error("Invalid match ID");
    }

    return data;
  })
  .handler(async ({ data }) => {
    const [eventExists, matchExists] = await Promise.all([
      db.query.events.findFirst({
        where: eq(events.id, data.eventId),
        columns: { id: true },
      }),
      db.query.matches.findFirst({
        where: eq(matches.id, data.matchId),
        columns: { id: true },
      }),
    ]);

    if (!eventExists) {
      throw new Error("Event does not exist");
    }

    if (!matchExists) {
      throw new Error("Match does not exist");
    }

    const updated = await db
      .update(matches)
      .set({ eventId: data.eventId })
      .where(eq(matches.id, data.matchId))
      .returning();

    return updated[0];
  });
