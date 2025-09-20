import { PieChart as RechartPieChart, Pie } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PieChartProps<T> = {
  chartConfig: ChartConfig;
  chartData: T[];
  label: string;
  select?: boolean;
  selectOptions?: {
    value: string;
    label: string;
  }[];
};

export const PieChart = <T,>({
  chartConfig,
  chartData,
  label,
  select,
  selectOptions,
}: PieChartProps<T>) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex items-center gap-2 space-y-0 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{label}</CardTitle>
        </div>

        {/* TODO: Fazer o filtro de acordo com o select */}
        {select && (
          <Select defaultValue={selectOptions?.[0].value}>
            <SelectTrigger
              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
              aria-label="Selecione um estado"
            >
              <SelectValue placeholder="Selecione um estado" />
            </SelectTrigger>

            <SelectContent className="rounded-xl">
              {selectOptions?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
          <RechartPieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="visitors" label nameKey="browser" />
            <ChartLegend content={<ChartLegendContent />} />
          </RechartPieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
