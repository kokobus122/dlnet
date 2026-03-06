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
  assignPlayerToTeam,
  createMatch,
  createPlayer,
  createTeam,
  getAllPlayers,
  getAllTeams,
} from "@/server/matches";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});

const createTeamSchema = z.object({
  name: z.string().min(2, "Team name is required"),
  country: z.string().min(2, "Country is required"),
  logo: z.string().url("Logo must be a valid URL"),
});

const createPlayerSchema = z.object({
  name: z.string().min(2, "Player real name is required"),
  ingameName: z.string().min(2, "In-game name is required"),
  country: z.string().min(2, "Country is required"),
});

const assignPlayerSchema = z.object({
  playerId: z.string().min(1, "Pick a player"),
  teamId: z.string().min(1, "Pick a team"),
  joinedAt: z.string().optional(),
});

const createMatchSchema = z.object({
  teamAId: z.string().min(1, "Pick team A"),
  teamBId: z.string().min(1, "Pick team B"),
  scoreA: z.coerce.number().min(0, "Score cannot be negative"),
  scoreB: z.coerce.number().min(0, "Score cannot be negative"),
  matchDate: z.string().min(1, "Match date is required"),
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
      </section>
    </main>
  );
}
