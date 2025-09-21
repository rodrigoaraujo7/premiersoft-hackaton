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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./button";

import { Sparkles } from "lucide-react";

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
      <CardHeader className="flex items-center gap-2 space-y-0 border-b sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{label}</CardTitle>
        </div>

        <div className="flex items-center gap-1">
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

          <Tooltip>
            <TooltipTrigger>
              <Button>
                <Sparkles size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Análise por IA</p>
            </TooltipContent>
          </Tooltip>
        </div>
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
