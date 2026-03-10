import { db } from "@/db";
import {
  events,
  matches,
  playerTeamHistory,
  players,
  teams,
} from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, isNull } from "drizzle-orm";

const parseDateInput = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value");
  }
  return date;
};

export const getAllMatches = createServerFn({
  method: "GET",
}).handler(async () => {
  return db.query.matches.findMany({
    with: {
      event: {
        columns: {
          id: true,
          title: true,
        },
      },
      teamARef: {
        columns: {
          id: true,
          name: true,
          country: true,
        },
      },
      teamBRef: {
        columns: {
          id: true,
          name: true,
          country: true,
        },
      },
    },
  });
});

export const getMatchesPage = createServerFn({
  method: "GET",
})
  .inputValidator((data: { page: number; limit: number }) => {
    if (
      typeof data.page !== "number" ||
      data.page <= 0 ||
      typeof data.limit !== "number" ||
      data.limit <= 0
    ) {
      throw new Error("Invalid pagination parameters");
    }

    return data;
  })
  .handler(async ({ data }) => {
    const pageMatches = await db.query.matches.findMany({
      with: {
        event: {
          columns: {
            id: true,
            title: true,
          },
        },
        teamARef: {
          columns: {
            id: true,
            name: true,
            country: true,
          },
        },
        teamBRef: {
          columns: {
            id: true,
            name: true,
            country: true,
          },
        },
      },
      orderBy: [desc(matches.matchDate)],
      limit: data.limit + 1,
      offset: (data.page - 1) * data.limit,
    });

    const hasMore = pageMatches.length > data.limit;

    return {
      matches: pageMatches.slice(0, data.limit),
      hasMore,
      page: data.page,
      limit: data.limit,
    };
  });

export const getAllTeams = createServerFn({
  method: "GET",
}).handler(async () => {
  return db.query.teams.findMany({
    orderBy: [teams.name],
  });
});

export const getAllEvents = createServerFn({
  method: "GET",
}).handler(async () => {
  return db.query.events.findMany({
    orderBy: [desc(events.createdAt)],
  });
});

export const createTeam = createServerFn({
  method: "POST",
})
  .inputValidator((data: { name: string; country: string; logo: string }) => {
    if (typeof data.name !== "string" || data.name.trim().length === 0) {
      throw new Error("Team name is required");
    }
    if (typeof data.country !== "string" || data.country.trim().length === 0) {
      throw new Error("Team country is required");
    }
    if (typeof data.logo !== "string" || data.logo.trim().length === 0) {
      throw new Error("Team logo is required");
    }

    return {
      name: data.name.trim(),
      country: data.country.trim(),
      logo: data.logo.trim(),
    };
  })
  .handler(async ({ data }) => {
    const created = await db.insert(teams).values(data).returning();
    return created[0];
  });

export const getAllPlayers = createServerFn({
  method: "GET",
}).handler(async () => {
  return db.query.players.findMany({
    with: {
      teamHistory: {
        with: {
          team: true,
        },
        orderBy: [desc(playerTeamHistory.joinedAt)],
      },
    },
  });
});

export const createPlayer = createServerFn({
  method: "POST",
})
  .inputValidator(
    (data: { name: string; ingameName: string; country: string }) => {
      if (typeof data.name !== "string" || data.name.trim().length === 0) {
        throw new Error("Player name is required");
      }
      if (
        typeof data.ingameName !== "string" ||
        data.ingameName.trim().length === 0
      ) {
        throw new Error("In-game name is required");
      }
      if (
        typeof data.country !== "string" ||
        data.country.trim().length === 0
      ) {
        throw new Error("Player country is required");
      }

      return {
        name: data.name.trim(),
        ingameName: data.ingameName.trim(),
        country: data.country.trim(),
      };
    },
  )
  .handler(async ({ data }) => {
    const created = await db.insert(players).values(data).returning();
    return created[0];
  });

export const assignPlayerToTeam = createServerFn({
  method: "POST",
})
  .inputValidator(
    (data: { playerId: number; teamId: number; joinedAt?: string | Date }) => {
      if (typeof data.playerId !== "number" || data.playerId <= 0) {
        throw new Error("Invalid player ID");
      }
      if (typeof data.teamId !== "number" || data.teamId <= 0) {
        throw new Error("Invalid team ID");
      }

      return {
        playerId: data.playerId,
        teamId: data.teamId,
        joinedAt: data.joinedAt ? parseDateInput(data.joinedAt) : new Date(),
      };
    },
  )
  .handler(async ({ data }) => {
    const [playerExists, teamExists] = await Promise.all([
      db.query.players.findFirst({
        where: eq(players.id, data.playerId),
        columns: { id: true },
      }),
      db.query.teams.findFirst({
        where: eq(teams.id, data.teamId),
        columns: { id: true },
      }),
    ]);

    if (!playerExists) {
      throw new Error("Player does not exist");
    }
    if (!teamExists) {
      throw new Error("Team does not exist");
    }

    await db
      .update(playerTeamHistory)
      .set({ leftAt: data.joinedAt })
      .where(
        and(
          eq(playerTeamHistory.playerId, data.playerId),
          isNull(playerTeamHistory.leftAt),
        ),
      );

    const created = await db
      .insert(playerTeamHistory)
      .values({
        playerId: data.playerId,
        teamId: data.teamId,
        joinedAt: data.joinedAt,
      })
      .returning();

    return created[0];
  });

export const getTeamActiveRoster = createServerFn({
  method: "GET",
})
  .inputValidator((data: { teamId: number }) => {
    if (typeof data.teamId !== "number" || data.teamId <= 0) {
      throw new Error("Invalid team ID");
    }
    return data;
  })
  .handler(async ({ data }) => {
    return db.query.playerTeamHistory.findMany({
      where: and(
        eq(playerTeamHistory.teamId, data.teamId),
        isNull(playerTeamHistory.leftAt),
      ),
      with: {
        player: true,
      },
      orderBy: [desc(playerTeamHistory.joinedAt)],
    });
  });

export const createMatch = createServerFn({
  method: "POST",
})
  .inputValidator(
    (data: {
      teamAId: number;
      teamBId: number;
      scoreA?: number;
      scoreB?: number;
      matchDate: string | Date;
    }) => {
      if (typeof data.teamAId !== "number" || data.teamAId <= 0) {
        throw new Error("Invalid team A ID");
      }
      if (typeof data.teamBId !== "number" || data.teamBId <= 0) {
        throw new Error("Invalid team B ID");
      }
      if (data.teamAId === data.teamBId) {
        throw new Error("A match requires two different teams");
      }

      return {
        teamAId: data.teamAId,
        teamBId: data.teamBId,
        scoreA: data.scoreA ?? 0,
        scoreB: data.scoreB ?? 0,
        matchDate: parseDateInput(data.matchDate),
      };
    },
  )
  .handler(async ({ data }) => {
    const [teamAExists, teamBExists] = await Promise.all([
      db.query.teams.findFirst({
        where: eq(teams.id, data.teamAId),
        columns: { id: true },
      }),
      db.query.teams.findFirst({
        where: eq(teams.id, data.teamBId),
        columns: { id: true },
      }),
    ]);

    if (!teamAExists || !teamBExists) {
      throw new Error("One or both selected teams do not exist");
    }

    const created = await db.insert(matches).values(data).returning();
    return created[0];
  });

export const getTeamById = createServerFn({
  method: "GET",
})
  .inputValidator((data: { teamId: number }) => {
    if (typeof data.teamId !== "number" || data.teamId <= 0) {
      throw new Error("Invalid team ID");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, data.teamId),
      with: {
        playerHistory: {
          with: {
            player: true,
          },
          orderBy: [desc(playerTeamHistory.joinedAt)],
        },
      },
    });

    if (!team) {
      throw new Error("Team not found");
    }

    return team;
  });

export const getTeamsByMatchId = createServerFn({
  method: "GET",
})
  .inputValidator((data: { matchId: number }) => {
    if (typeof data.matchId !== "number" || data.matchId <= 0) {
      throw new Error("Invalid match ID");
    }

    return data;
  })
  .handler(async ({ data }) => {
    const match = await db.query.matches.findFirst({
      where: eq(matches.id, data.matchId),
      columns: {
        id: true,
      },
      with: {
        teamARef: {
          columns: {
            id: true,
            name: true,
            country: true,
            logo: true,
          },
        },
        teamBRef: {
          columns: {
            id: true,
            name: true,
            country: true,
            logo: true,
          },
        },
      },
    });

    if (!match) {
      throw new Error("Match not found");
    }

    return {
      teamA: match.teamARef,
      teamB: match.teamBRef,
    };
  });

export const getMatchById = createServerFn({
  method: "GET",
})
  .inputValidator((data: { matchId: number }) => {
    if (typeof data.matchId !== "number" || data.matchId <= 0) {
      throw new Error("Invalid match ID");
    }

    return data;
  })
  .handler(async ({ data }) => {
    const match = await db.query.matches.findFirst({
      where: eq(matches.id, data.matchId),
      with: {
        teamARef: {
          columns: {
            id: true,
            name: true,
            country: true,
            logo: true,
          },
        },
        teamBRef: {
          columns: {
            id: true,
            name: true,
            country: true,
            logo: true,
          },
        },
      },
    });

    if (!match) {
      throw new Error("Match not found");
    }

    return match;
  });
