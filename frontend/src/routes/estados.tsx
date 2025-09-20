import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/estados')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/estados"!</div>
}
