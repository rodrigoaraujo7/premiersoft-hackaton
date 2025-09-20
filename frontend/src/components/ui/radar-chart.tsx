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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RadarChartProps<T> = {
  chartConfig: ChartConfig;
  chartData: T[];
  label: string;
  select?: boolean;
  selectOptions?: {
    value: string;
    label: string;
  }[];
};

export function RadarChart<T>({
  chartConfig,
  chartData,
  label,
  select,
  selectOptions,
}: RadarChartProps<T>) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{label}</CardTitle>
        </div>

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
