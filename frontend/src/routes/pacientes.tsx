import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pacientes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/pacientes"!</div>
}
