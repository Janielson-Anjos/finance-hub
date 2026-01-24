"use client";

import { Pie, PieChart } from "recharts";

import { Card, CardContent } from "@/app/_components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/_components/ui/chart";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { TransactionType } from "@prisma/client";
import { TransactionPercentagePerType } from "@/app/_data/get-dashboard/types";
import { formatCurrency } from "@/app/_utils/currency";
import { PiggyBankIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import PercentageItem from "./percentage-item";

const chartConfig = {
  [TransactionType.INVESTMENT]: {
    label: "Investido",
    color: "#FFFFFF",
  },
  [TransactionType.DEPOSIT]: {
    label: "Receita",
    color: "#55B02E",
  },
  [TransactionType.EXPENSE]: {
    label: "Despesas",
    color: "#E93030",
  },
} satisfies ChartConfig;

interface TransactionsPieChartProps {
  typesPercentage: TransactionPercentagePerType;
  investimentsTotal: number;
  depositsTotal: number;
  expensesTotal: number;
}

const TransactionsPieChart = ({
  typesPercentage,
  investimentsTotal,
  depositsTotal,
  expensesTotal,
}: TransactionsPieChartProps) => {
  const chartData = [
    {
      type: TransactionType.DEPOSIT,
      amount: depositsTotal,
      fill: "#55B02E",
    },
    {
      type: TransactionType.INVESTMENT,
      amount: investimentsTotal,
      fill: "#FFFFFF",
    },
    {
      type: TransactionType.EXPENSE,
      amount: expensesTotal,
      fill: "#E93030",
    },
  ];

  const tooltipFormatter = (
    value: unknown,
    name: unknown,
    item: unknown,
    index: number,
    payload: unknown,
  ) => {
    // Converte o valor para número, lidando com diferentes tipos
    let numericValue = 0;
    if (typeof value === "number") {
      numericValue = value;
    } else if (typeof value === "string") {
      numericValue = parseFloat(value) || 0;
    } else if (Array.isArray(value) && value.length > 0) {
      const firstValue = value[0];
      numericValue =
        typeof firstValue === "number"
          ? firstValue
          : parseFloat(String(firstValue)) || 0;
    }

    // Extrai informações do payload
    const payloadObj = payload as
      | { type?: TransactionType; fill?: string }
      | undefined;
    const itemObj = item as { color?: string } | undefined;

    const type = payloadObj?.type as TransactionType;
    const label = chartConfig[type]?.label || String(name || "");
    const color = payloadObj?.fill || itemObj?.color;

    return (
      <div className="flex w-full items-center gap-2">
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
          style={{ backgroundColor: color }}
        />
        <div className="flex flex-1 items-center gap-2 leading-none">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatCurrency(numericValue)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className="flex flex-col border-white/10 p-3">
      <ScrollArea className="h-full max-h-[400px] sm:max-h-[500px]">
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[200px] sm:max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent hideLabel formatter={tooltipFormatter} />
                }
              />
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="type"
                innerRadius={60}
              />
            </PieChart>
          </ChartContainer>
          <div className="space-y-2">
            <PercentageItem
              icon={<TrendingUpIcon size={16} className="text-primary" />}
              title="Receita"
              value={typesPercentage[TransactionType.DEPOSIT]}
            />
            <PercentageItem
              icon={<TrendingDownIcon size={16} className="text-danger" />}
              title="Despesas"
              value={typesPercentage[TransactionType.EXPENSE]}
            />
            <PercentageItem
              icon={<PiggyBankIcon size={16} />}
              title="Investido"
              value={typesPercentage[TransactionType.INVESTMENT]}
            />
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default TransactionsPieChart;
