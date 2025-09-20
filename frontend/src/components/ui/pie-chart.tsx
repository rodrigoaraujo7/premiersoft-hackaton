import { PieChart as RechartPieChart, Pie } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type PieChartProps<T> = {
  chartConfig: ChartConfig;
  chartData: T[];
  label: string;
  description?: string;
};

export const PieChart = <T,>({
  chartConfig,
  chartData,
  label,
  description,
}: PieChartProps<T>) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
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
