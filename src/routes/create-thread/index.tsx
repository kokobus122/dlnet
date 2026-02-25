import { CreatePostForm } from '@/components/CreatePostForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/create-thread/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreatePostForm />
}
