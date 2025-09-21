import { createFileRoute } from "@tanstack/react-router";

import { type ColumnDef } from "@tanstack/react-table";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/ui/data-table";
import { PieChart } from "@/components/ui/pie-chart";
import type { ChartConfig } from "@/components/ui/chart";

import type { Paciente } from "@/types/paciente";

import { usePacientes } from "@/api/get-pacientes";

export const Route = createFileRoute("/pacientes")({
  component: RouteComponent,
});

const columns: ColumnDef<Paciente>[] = [
  {
    accessorKey: "nome_completo",
    header: "Nome",
  },
  {
    accessorKey: "cpf",
    header: "CPF",
  },
  {
    accessorKey: "genero",
    header: "Gênero",
  },
  {
    accessorKey: "bairro",
    header: "Bairro",
  },
  {
    accessorKey: "convenio",
    header: "Convênio",
  },
  {
    accessorKey: "cid",
    header: "CID",
  },
];

const pieChartData = [
  { browser: "chrome", visitors: 275, fill: "#171717" },
  { browser: "safari", visitors: 200, fill: "#404040" },
  { browser: "firefox", visitors: 187, fill: "#737373" },
  { browser: "edge", visitors: 173, fill: "#d4d4d4" },
  { browser: "other", visitors: 90, fill: "#f5f5f5" },
];

const pieChartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

function RouteComponent() {
  const { data: pacientes, isLoading, error } = usePacientes();

  if (isLoading) {
    return (
      <section className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Carregando pacientes...</p>
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
            Erro ao carregar os dados dos pacientes: {error.message}
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  return (
    <section className="container mx-auto py-10">
      <div className="flex flex-col gap-2">
        {/* TODO: PIZZA -> mostrar distribuição por convenio */}
        <PieChart
          chartConfig={pieChartConfig}
          chartData={pieChartData}
          label="Distribuição de pacientes por convenio"
        />

        <Alert variant="default" className="bg-gray-100">
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components and dependencies to your app using the cli.
          </AlertDescription>
        </Alert>
      </div>

      <br />

      <DataTable data={pacientes?.data || []} columns={columns} />
    </section>
  );
}
