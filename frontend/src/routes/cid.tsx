import { createFileRoute } from "@tanstack/react-router";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { RadarChart } from "@/components/ui/radar-chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { CID } from "@/types/cid";
import { useCID } from "@/api/get-cid";

export const Route = createFileRoute("/cid")({
  component: RouteComponent,
});

const columns: ColumnDef<CID>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
  },
  {
    accessorKey: "descricao",
    header: "Nome",
  },
];

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 273 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#171717",
  },
} satisfies ChartConfig;

const selectOptions = [{ value: "1", label: "CID" }];

function RouteComponent() {
  const { data: cid, isLoading, error } = useCID();

  if (isLoading) {
    return (
      <section className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Carregando cid...</p>
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
            Erro ao carregar os dados dos cid: {error.message}
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  return (
    <section className="container mx-auto py-10">
      <div className="flex flex-col gap-2">
        {/* TODO: Mostrar quantidade de cid por região */}
        <RadarChart
          chartConfig={chartConfig}
          chartData={chartData}
          label="Quantidade de CID por região"
          select
          selectOptions={selectOptions}
        />

        <Alert variant="default" className="bg-gray-100">
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components and dependencies to your app using the cli.
          </AlertDescription>
        </Alert>
      </div>

      <br />

      <DataTable data={cid?.data || []} columns={columns} />
    </section>
  );
}
