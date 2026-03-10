import { SubNavbar } from "@/components/SubNavbar";
import type { Match } from "@/db/schema";
import type { SubNavPage } from "@/lib/types/subnavbar";
import { formatMatchTitle } from "@/lib/utils";
import { getMatchesPage } from "@/server/matches";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

const PAGE_SIZE = 10;
const QUERY_STALE_TIME = 30_000;

const matchesPageQueryOptions = (page: number) => ({
  queryKey: ["matches", page, PAGE_SIZE],
  queryFn: () => getMatchesPage({ data: { page, limit: PAGE_SIZE } }),
});

export const Route = createFileRoute("/matches/")({
  validateSearch: (search: Record<string, unknown>) => {
    const page = Number(search.page);

    return {
      page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    };
  },
  loaderDeps: ({ search }) => ({
    page: search.page,
  }),
  loader: async ({ context, deps }) => {
    return context.queryClient.ensureQueryData(
      matchesPageQueryOptions(deps.page),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const initialData = Route.useLoaderData();

  const { data, isPending } = useQuery({
    ...matchesPageQueryOptions(search.page),
    initialData,
    placeholderData: keepPreviousData,
    staleTime: QUERY_STALE_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const pages: SubNavPage[] = [
    {
      title: "Schedule",
      active: true,
    },
    {
      title: "Results",
      active: false,
    },
  ];

  const matches = data?.matches ?? [];
  const isFirstPage = search.page <= 1;
  const canGoNext = data?.hasMore ?? false;

  const goToPage = (page: number) => {
    navigate({
      to: "/matches",
      search: (prev) => ({
        ...prev,
        page,
      }),
    });
  };

  return (
    <>
      <SubNavbar pages={pages} />
      <MatchSection matches={matches} />
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => goToPage(search.page - 1)}
          disabled={isFirstPage || isPending}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {search.page}</span>
        <button
          type="button"
          onClick={() => goToPage(search.page + 1)}
          disabled={!canGoNext || isPending}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
}

const MatchSection = ({
  matches,
}: {
  matches: Match[]
}) => {
  return (
    <>
      <h1>
        {matches.map((match) => (
          <Link
            to="/$matchId/$matchTitle"
            params={{
              matchId: String(match.id),
              matchTitle: formatMatchTitle(match.teamAName, match.teamBName),
            }}
            key={match.id}
            className="flex justify-between gap-4 text-xs bg-forest hover:bg-forest/70 border-b border-sage px-4 py-2"
          >
            <div className="flex-1">
              <div className="flex justify-between gap-4">
                <div className="flex flex-col text-neutral-200 gap-1 min-w-fit">
                  <h1 className="font-bold">{match.teamAName}</h1>
                  <h1 className="font-bold">{match.teamBName}</h1>
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
        ))}
      </h1>
    </>
  );
};
