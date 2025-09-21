import { createFileRoute } from "@tanstack/react-router";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { Estado } from "@/types/estado";

import { useEstados } from "@/api/get-estados";

export const Route = createFileRoute("/estados")({
  component: RouteComponent,
});

const columns: ColumnDef<Estado>[] = [
  {
    accessorKey: "codigo_uf",
    header: "Código UF",
  },
  {
    accessorKey: "uf",
    header: "UF",
  },
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "regiao",
    header: "Região",
  },
  {
    accessorKey: "latitude",
    header: "Latitude",
  },
  {
    accessorKey: "longitude",
    header: "Longitude",
  },
];

function RouteComponent() {
  const { data: estados, isLoading, error } = useEstados();

  if (isLoading) {
    return (
      <section className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Carregando estados...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTitle>Erro!</AlertTitle>
          <AlertDescription>
            Erro ao carregar os dados dos estados: {error.message}
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  return (
    <section className="container mx-auto py-10">
      <DataTable data={estados?.data || []} columns={columns} />
    </section>
  );
}
