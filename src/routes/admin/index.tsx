import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  assignMatchToEventSchema,
  assignPlayerSchema,
  assignTeamToEventSchema,
  createEventSchema,
  createMatchSchema,
  createPlayerSchema,
  createTeamSchema,
} from "@/schema/matchSchema";
import {
  assignMatchToEvent,
  assignTeamToEvent,
  createEvent,
} from "@/server/events";
import {
  assignPlayerToTeam,
  createMatch,
  createPlayer,
  createTeam,
  getAllEvents,
  getAllMatches,
  getAllPlayers,
  getAllTeams,
} from "@/server/matches";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type z from "zod/v3";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
  // beforeLoad: async () => {
  //   const owner = await isOwner();

  //   if (!owner) {
  //     throw redirect({ to: "/" });
  //   }
  // },
});

function RouteComponent() {
  const { data: teams = [], refetch: refetchTeams } = useQuery({
    queryKey: ["admin", "teams"],
    queryFn: async () => getAllTeams(),
  });

  const { data: players = [], refetch: refetchPlayers } = useQuery({
    queryKey: ["admin", "players"],
    queryFn: async () => getAllPlayers(),
  });

  const { data: events = [], refetch: refetchEvents } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: async () => getAllEvents(),
  });

  const { data: matches = [], refetch: refetchMatches } = useQuery({
    queryKey: ["admin", "matches"],
    queryFn: async () => getAllMatches(),
  });

  const teamForm = useForm<z.infer<typeof createTeamSchema>>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      country: "",
      logo: "",
    },
  });

  const playerForm = useForm<z.infer<typeof createPlayerSchema>>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: {
      name: "",
      ingameName: "",
      country: "",
    },
  });

  const assignForm = useForm<z.infer<typeof assignPlayerSchema>>({
    resolver: zodResolver(assignPlayerSchema),
    defaultValues: {
      playerId: "",
      teamId: "",
      joinedAt: "",
    },
  });

  const eventForm = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      logo: "",
      prizePool: 0,
      location: "",
      startDate: "",
      endDate: "",
    },
  });

  const assignTeamToEventForm = useForm<
    z.infer<typeof assignTeamToEventSchema>
  >({
    resolver: zodResolver(assignTeamToEventSchema),
    defaultValues: {
      eventId: "",
      teamId: "",
      seed: "",
    },
  });

  const assignMatchToEventForm = useForm<
    z.infer<typeof assignMatchToEventSchema>
  >({
    resolver: zodResolver(assignMatchToEventSchema),
    defaultValues: {
      eventId: "",
      matchId: "",
    },
  });

  const matchForm = useForm<z.infer<typeof createMatchSchema>>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      teamAId: "",
      teamBId: "",
      scoreA: 0,
      scoreB: 0,
      matchDate: "",
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createTeamSchema>) =>
      createTeam({ data: values }),
    onSuccess: () => {
      teamForm.reset();
      refetchTeams();
    },
  });

  const createPlayerMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createPlayerSchema>) =>
      createPlayer({ data: values }),
    onSuccess: () => {
      playerForm.reset();
      refetchPlayers();
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createEventSchema>) =>
      createEvent({ data: values }),
    onSuccess: () => {
      eventForm.reset();
      refetchEvents();
    },
  });

  const assignPlayerMutation = useMutation({
    mutationFn: async (values: z.infer<typeof assignPlayerSchema>) =>
      assignPlayerToTeam({
        data: {
          playerId: Number(values.playerId),
          teamId: Number(values.teamId),
          joinedAt: values.joinedAt || undefined,
        },
      }),
    onSuccess: () => {
      assignForm.reset({ playerId: "", teamId: "", joinedAt: "" });
      refetchPlayers();
      refetchTeams();
    },
  });

  const assignTeamToEventMutation = useMutation({
    mutationFn: async (values: z.infer<typeof assignTeamToEventSchema>) =>
      assignTeamToEvent({
        data: {
          eventId: Number(values.eventId),
          teamId: Number(values.teamId),
          seed:
            values.seed && values.seed.trim().length > 0
              ? Number(values.seed)
              : null,
        },
      }),
    onSuccess: () => {
      assignTeamToEventForm.reset({ eventId: "", teamId: "", seed: "" });
      refetchEvents();
    },
  });

  const assignMatchToEventMutation = useMutation({
    mutationFn: async (values: z.infer<typeof assignMatchToEventSchema>) =>
      assignMatchToEvent({
        data: {
          eventId: Number(values.eventId),
          matchId: Number(values.matchId),
        },
      }),
    onSuccess: () => {
      assignMatchToEventForm.reset({ eventId: "", matchId: "" });
      refetchMatches();
      refetchEvents();
    },
  });

  const createMatchMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createMatchSchema>) =>
      createMatch({
        data: {
          teamAId: Number(values.teamAId),
          teamBId: Number(values.teamBId),
          scoreA: values.scoreA,
          scoreB: values.scoreB,
          matchDate: values.matchDate,
        },
      }),
    onSuccess: () => {
      matchForm.reset({
        teamAId: "",
        teamBId: "",
        scoreA: 0,
        scoreB: 0,
        matchDate: "",
      });
    },
  });

  return (
    <main className="bg-charcoal min-h-screen p-6 md:p-10">
      <section className="mx-auto max-w-5xl space-y-8">
        <h1 className="text-2xl font-bold text-cream">Admin Panel</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-forest border border-sage rounded-xs p-4">
            <h2 className="mb-4 text-sm font-bold uppercase text-cream">
              Create Team
            </h2>
            <Form {...teamForm}>
              <form
                className="space-y-4"
                onSubmit={teamForm.handleSubmit((values) =>
                  createTeamMutation.mutate(values),
                )}
              >
                <FormField
                  control={teamForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input className="bg-charcoal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={teamForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input className="bg-charcoal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={teamForm.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input className="bg-charcoal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createTeamMutation.isPending}>
                  {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="bg-forest border border-sage rounded-xs p-4">
            <h2 className="mb-4 text-sm font-bold uppercase text-cream">
              Create Player
            </h2>
            <Form {...playerForm}>
              <form
                className="space-y-4"
                onSubmit={playerForm.handleSubmit((values) =>
                  createPlayerMutation.mutate(values),
                )}
              >
                <FormField
                  control={playerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Real Name</FormLabel>
                      <FormControl>
                        <Input className="bg-charcoal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={playerForm.control}
                  name="ingameName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>In-Game Name</FormLabel>
                      <FormControl>
                        <Input className="bg-charcoal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={playerForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input className="bg-charcoal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createPlayerMutation.isPending}>
                  {createPlayerMutation.isPending
                    ? "Creating..."
                    : "Create Player"}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="bg-forest border border-sage rounded-xs p-4">
          <h2 className="mb-4 text-sm font-bold uppercase text-cream">
            Assign Player To Team
          </h2>
          <Form {...assignForm}>
            <form
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
              onSubmit={assignForm.handleSubmit((values) =>
                assignPlayerMutation.mutate(values),
              )}
            >
              <FormField
                control={assignForm.control}
                name="playerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-charcoal w-full">
                          <SelectValue placeholder="Select player" />
                        </SelectTrigger>
                        <SelectContent>
                          {players.map((player) => (
                            <SelectItem
                              key={player.id}
                              value={String(player.id)}
                            >
                              {player.ingameName} ({player.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={assignForm.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-charcoal w-full">
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={String(team.id)}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={assignForm.control}
                name="joinedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joined At (optional)</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-charcoal"
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-3">
                <Button type="submit" disabled={assignPlayerMutation.isPending}>
                  {assignPlayerMutation.isPending
                    ? "Assigning..."
                    : "Assign Player"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-forest border border-sage rounded-xs p-4">
            <h2 className="mb-4 text-sm font-bold uppercase text-cream">
              Create Event
            </h2>
            <Form {...eventForm}>
              <form
                className="space-y-4"
                onSubmit={eventForm.handleSubmit((values) =>
                  createEventMutation.mutate(values),
                )}
              >
                <FormField
                  control={eventForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input className="bg-charcoal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={eventForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input className="bg-charcoal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={eventForm.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Logo URL</FormLabel>
                      <FormControl>
                        <Input className="bg-charcoal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={eventForm.control}
                  name="prizePool"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prize Pool</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-charcoal"
                          type="number"
                          min={0}
                          {...field}
                          onChange={(event) =>
                            field.onChange(Number(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={eventForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input className="bg-charcoal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={eventForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-charcoal"
                          type="datetime-local"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={eventForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-charcoal"
                          type="datetime-local"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={createEventMutation.isPending}>
                  {createEventMutation.isPending
                    ? "Creating..."
                    : "Create Event"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="bg-forest border border-sage rounded-xs p-4">
            <h2 className="mb-4 text-sm font-bold uppercase text-cream">
              Assign Team To Event
            </h2>
            <Form {...assignTeamToEventForm}>
              <form
                className="space-y-4"
                onSubmit={assignTeamToEventForm.handleSubmit((values) =>
                  assignTeamToEventMutation.mutate(values),
                )}
              >
                <FormField
                  control={assignTeamToEventForm.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="bg-charcoal w-full">
                            <SelectValue placeholder="Select event" />
                          </SelectTrigger>
                          <SelectContent>
                            {events.map((event) => (
                              <SelectItem
                                key={event.id}
                                value={String(event.id)}
                              >
                                {event.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={assignTeamToEventForm.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="bg-charcoal w-full">
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map((team) => (
                              <SelectItem key={team.id} value={String(team.id)}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={assignTeamToEventForm.control}
                  name="seed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seed (optional)</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-charcoal"
                          type="number"
                          min={1}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={assignTeamToEventMutation.isPending}
                >
                  {assignTeamToEventMutation.isPending
                    ? "Assigning..."
                    : "Assign Team"}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="bg-forest border border-sage rounded-xs p-4">
          <h2 className="mb-4 text-sm font-bold uppercase text-cream">
            Create Match
          </h2>
          <Form {...matchForm}>
            <form
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
              onSubmit={matchForm.handleSubmit((values) =>
                createMatchMutation.mutate(values),
              )}
            >
              <FormField
                control={matchForm.control}
                name="teamAId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team A</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-charcoal w-full">
                          <SelectValue placeholder="Select team A" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={String(team.id)}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={matchForm.control}
                name="teamBId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team B</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-charcoal w-full">
                          <SelectValue placeholder="Select team B" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={String(team.id)}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={matchForm.control}
                name="scoreA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score A</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-charcoal"
                        type="number"
                        min={0}
                        {...field}
                        onChange={(event) =>
                          field.onChange(Number(event.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={matchForm.control}
                name="scoreB"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score B</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-charcoal"
                        type="number"
                        min={0}
                        {...field}
                        onChange={(event) =>
                          field.onChange(Number(event.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={matchForm.control}
                name="matchDate"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Match Date</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-charcoal"
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <Button type="submit" disabled={createMatchMutation.isPending}>
                  {createMatchMutation.isPending
                    ? "Creating..."
                    : "Create Match"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="bg-forest border border-sage rounded-xs p-4">
          <h2 className="mb-4 text-sm font-bold uppercase text-cream">
            Assign Match To Event
          </h2>
          <Form {...assignMatchToEventForm}>
            <form
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
              onSubmit={assignMatchToEventForm.handleSubmit((values) =>
                assignMatchToEventMutation.mutate(values),
              )}
            >
              <FormField
                control={assignMatchToEventForm.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-charcoal w-full">
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={String(event.id)}>
                              {event.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={assignMatchToEventForm.control}
                name="matchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-charcoal w-full">
                          <SelectValue placeholder="Select match" />
                        </SelectTrigger>
                        <SelectContent>
                          {matches.map((match) => (
                            <SelectItem key={match.id} value={String(match.id)}>
                              #{match.id} {match.teamARef?.name ?? "TBD"} vs{" "}
                              {match.teamBRef?.name ?? "TBD"}
                              {match.event
                                ? ` · Current Event: ${match.event.title}`
                                : " · Current Event: None"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={assignMatchToEventMutation.isPending}
                >
                  {assignMatchToEventMutation.isPending
                    ? "Assigning..."
                    : "Assign Match"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </section>
    </main>
  );
}
