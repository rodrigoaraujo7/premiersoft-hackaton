import { createFileRoute } from "@tanstack/react-router";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { PieChart } from "@/components/ui/pie-chart";

import type { Paciente } from "@/types/paciente";
import type { ChartConfig } from "@/components/ui/chart";

export const Route = createFileRoute("/pacientes")({
  component: RouteComponent,
});

const defaultData: Paciente[] = [
  {
    codigo: "1",
    nome_completo: "João da Silva",
    genero: "Masculino",
    cod_municipio: "1",
    bairro: "Bairro X",
    convenio: "Convênio X",
    cid: "Cid X",
    cpf: "12345678901",
  },
];

const columns: ColumnDef<Paciente>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
  },
  {
    accessorKey: "nome_completo",
    header: "Nome",
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
    accessorKey: "cod_municipio",
    header: "Código do Município",
  },
  {
    accessorKey: "convenio",
    header: "Convênio",
  },
  {
    accessorKey: "cid",
    header: "CID",
  },
  {
    accessorKey: "cpf",
    header: "CPF",
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
  const data = defaultData;

  return (
    <section className="container mx-auto py-10">
      {/* TODO: Colocar um select de estado para filtrar as cidades */}
      {/* TODO: PIZZA -> mostrar distribuição de hospitais por cidade */}
      <PieChart
        chartConfig={pieChartConfig}
        chartData={pieChartData}
        label="Distribuição de hospitais por cidade"
      />

      <br />

      <DataTable data={data} columns={columns} />
    </section>
  );
}
