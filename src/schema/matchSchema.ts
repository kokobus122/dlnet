import z from "zod/v3";

export const createTeamSchema = z.object({
  name: z.string().min(2, "Team name is required"),
  country: z.string().min(2, "Country is required"),
  logo: z.string().url("Logo must be a valid URL"),
});

export const createPlayerSchema = z.object({
  name: z.string().min(2, "Player real name is required"),
  ingameName: z.string().min(2, "In-game name is required"),
  country: z.string().min(2, "Country is required"),
});

export const assignPlayerSchema = z.object({
  playerId: z.string().min(1, "Pick a player"),
  teamId: z.string().min(1, "Pick a team"),
  joinedAt: z.string().optional(),
});

export const createMatchSchema = z.object({
  teamAId: z.string().min(1, "Pick team A"),
  teamBId: z.string().min(1, "Pick team B"),
  scoreA: z.coerce.number().min(0, "Score cannot be negative"),
  scoreB: z.coerce.number().min(0, "Score cannot be negative"),
  matchDate: z.string().min(1, "Match date is required"),
});

export const createEventSchema = z.object({
  title: z.string().min(2, "Event title is required"),
  description: z.string().min(2, "Event description is required"),
  logo: z.string().url("Event logo must be a valid URL"),
  prizePool: z.coerce
    .number()
    .min(0, "Prize pool must be a non-negative number"),
  location: z.string().min(2, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export const assignTeamToEventSchema = z.object({
  eventId: z.string().min(1, "Pick an event"),
  teamId: z.string().min(1, "Pick a team"),
  seed: z
    .string()
    .optional()
    .refine(
      (value) =>
        value === undefined || value === "" || !Number.isNaN(Number(value)),
      {
        message: "Seed must be a valid number",
      },
    ),
});

export const assignMatchToEventSchema = z.object({
  eventId: z.string().min(1, "Pick an event"),
  matchId: z.string().min(1, "Pick a match"),
});
