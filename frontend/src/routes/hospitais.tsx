import { createFileRoute } from "@tanstack/react-router";

import { type ColumnDef } from "@tanstack/react-table";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { BarChart } from "@/components/ui/bar-chart";
import { PieChart } from "@/components/ui/pie-chart";

import { ArrowUpDown } from "lucide-react";

import type { Hospital } from "@/types/hospital";
import type { ChartConfig } from "@/components/ui/chart";

export const Route = createFileRoute("/hospitais")({
  component: RouteComponent,
});

const defaultData: Hospital[] = [
  {
    codigo: "1",
    nome: "Hospital X",
    cidade: 1,
    bairro: "Bairro X",
    especialidade: "Cardiologista",
    leitos_totais: 100,
  },
];

const columns: ColumnDef<Hospital>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
  },
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "cidade",
    header: "Cidade",
  },
  {
    accessorKey: "bairro",
    header: "Bairro",
  },
  {
    accessorKey: "especialidade",
    header: "Especialidade",
  },
  {
    accessorKey: "leitos_totais",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Leitos Totais <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
];

const barChartData = [
  { month: "Jan", desktop: 100, mobile: 50 },
  { month: "Feb", desktop: 150, mobile: 70 },
  { month: "Mar", desktop: 120, mobile: 60 },
  { month: "Apr", desktop: 180, mobile: 90 },
  { month: "May", desktop: 130, mobile: 75 },
];

const barchartConfig = {
  desktop: {
    label: "Categoria 1",
    color: "#171717",
  },
  mobile: {
    label: "Categoria 2",
    color: "#404040",
  },
} satisfies ChartConfig;

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
      <div className="flex flex-col gap-2">
        {/* TODO: Mostrar quantos leitos existem em cada especialidade hospitalar */}
        <BarChart
          chartConfig={barchartConfig}
          chartData={barChartData}
          label="Quantidade de leitos por especialidade hospitalar"
        />

        <Alert variant="default" className="bg-gray-100">
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components and dependencies to your app using the cli.
          </AlertDescription>
        </Alert>
      </div>

      <br />

      <div className="flex flex-col gap-2">
        {/* TODO: PIZZA -> mostrar distribuição de hospitais por região */}
        <PieChart
          chartConfig={pieChartConfig}
          chartData={pieChartData}
          label="Distribuição de hospitais por região"
        />

        <Alert variant="default" className="bg-gray-100">
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components and dependencies to your app using the cli.
          </AlertDescription>
        </Alert>
      </div>

      <br />

      <DataTable data={data} columns={columns} />
    </section>
  );
}
