import { createFileRoute } from "@tanstack/react-router";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

import { ArrowUpDown } from "lucide-react";

import type { Medico } from "@/types/medicos";

export const Route = createFileRoute("/medico")({
  component: Medico,
});

const defaultData: Medico[] = [
  {
    id: "1",
    nome_completo: "John Doe",
    especialidade: "Cardiologist",
    cidade: 1,
  },
];

const columns: ColumnDef<Medico>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "nome_completo",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "especialidade",
    header: "Especialidade",
  },
  {
    accessorKey: "cidade",
    header: "Cidade",
  },
];

function Medico() {
  const data = defaultData;

  return (
    <div className="container mx-auto py-10">
      <DataTable data={data} columns={columns} />
    </div>
  );
}
