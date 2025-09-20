import { createFileRoute } from "@tanstack/react-router";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";

import type { Estado } from "@/types/estado";

export const Route = createFileRoute("/estados")({
  component: RouteComponent,
});

const defaultData: Estado[] = [
  {
    codigo_uf: 1,
    uf: "SP",
    nome: "Estado X",
    latitude: 1,
    longitude: 1,
    regiao: "Região X",
  },
];

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
  const data = defaultData;

  return (
    <section className="container mx-auto py-10">
      <DataTable data={data} columns={columns} />
    </section>
  );
}
