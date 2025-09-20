import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/municipios')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/municipios"!</div>
}
