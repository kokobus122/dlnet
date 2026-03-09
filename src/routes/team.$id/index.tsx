import { getTeamById } from '@/server/matches'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/team/$id/')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const team = await getTeamById({ data: { teamId: parseInt(params.id) } })
    return { team }
  }
})

function RouteComponent() {
  const { team } = Route.useLoaderData()
  return <>
    <h1>{team.name}</h1>
    <p>Country: {team.country}</p>
    <p>Players:</p>
    <ul>
      {team.playerHistory.map((entry) => (
        <li key={entry.id}>
          {entry.player.ingameName} ({entry.player.name}) - Joined on{' '}
          {new Date(entry.joinedAt).toLocaleDateString()}
        </li>
      ))}
    </ul>
  </>
}
