import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/medico")({
  component: Medico,
});

import { type ColumnDef } from "@tanstack/react-table";

import type { Medico } from "@/types/medicos";
import { DataTable } from "@/components/ui/data-table";

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
    header: () => <div className="text-right">ID</div>,
  },
  {
    accessorKey: "nome_completo",
    header: "Nome Completo",
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
