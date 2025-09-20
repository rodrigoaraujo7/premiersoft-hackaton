import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/cid')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/cid"!</div>
}
