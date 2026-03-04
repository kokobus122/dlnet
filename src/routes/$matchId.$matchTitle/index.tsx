import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$matchId/$matchTitle/')({
  component: RouteComponent,
})

function RouteComponent() {
  const {matchId, matchTitle} = Route.useParams()
  return <div>Hello "/{matchId}/{matchTitle}/"!</div>
}
