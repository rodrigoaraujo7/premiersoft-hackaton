import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RechartRadarChart,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type RadarChartProps<T> = {
  chartConfig: ChartConfig;
  chartData: T[];
  label: string;
};

export function RadarChart<T>({
  chartConfig,
  chartData,
  label,
}: RadarChartProps<T>) {
  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RechartRadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="month" />
            <PolarGrid />
            <Radar
              dataKey="desktop"
              fill="var(--color-desktop)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RechartRadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
