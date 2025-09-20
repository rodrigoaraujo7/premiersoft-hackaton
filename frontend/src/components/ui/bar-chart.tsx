import {
  Bar,
  BarChart as RechartBarChart,
  CartesianGrid,
  XAxis,
} from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BarChartProps<T> = {
  chartConfig: ChartConfig;
  chartData: T[];
  label: string;
};

export const BarChart = <T,>({
  chartConfig,
  chartData,
  label,
}: BarChartProps<T>) => {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b sm:flex-row">
        <CardTitle className="grid flex-1 gap-1">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <RechartBarChart accessibilityLayer data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" />
          </RechartBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
