"use client";

import { useMemo } from 'react';
import type { AdClick } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { columns } from './columns';
import { DataTable } from '../articles/data-table';
import { BarChart3, Table2 } from 'lucide-react';

interface StatisticsClientProps {
  adClicks: AdClick[];
}

export function StatisticsClient({ adClicks }: StatisticsClientProps) {

  const clicksByAdName = useMemo(() => {
    const counts: { [key: string]: number } = {};
    adClicks.forEach(click => {
      counts[click.adName] = (counts[click.adName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [adClicks]);

  const chartConfig = {
    count: {
      label: "Clics",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <div className="space-y-6">
       <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            Rendimiento de anuncios
          </CardTitle>
          <CardDescription>Total de clics por cada espacio publicitario.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {clicksByAdName.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <BarChart accessibilityLayer data={clicksByAdName}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <BarChart3 className="h-10 w-10 opacity-30 mb-2" />
              <p className="text-sm">No hay datos de clics todavía.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Table2 className="h-5 w-5 text-muted-foreground" />
            Registro de clics
          </CardTitle>
          <CardDescription>Lista detallada de todos los clics en anuncios.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={adClicks} />
        </CardContent>
      </Card>
    </div>
  );
}
