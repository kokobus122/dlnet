import { SubNavbar } from "@/components/SubNavbar";
import type { SubNavPage } from "@/lib/types/subnavbar";
import { getAllMatches } from "@/server/matches";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/matches/")({
  component: RouteComponent,
  loader: async () => {
    const matches = await getAllMatches();
    return { matches };
  },
});

function RouteComponent() {
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
  const { matches } = Route.useLoaderData();
  return (
    <>
      <SubNavbar pages={pages} />
    </>
  );
}
