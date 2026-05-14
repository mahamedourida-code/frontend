"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const benchmarkData = [
  { provider: "AxLiner", accuracy: 96.8 },
  { provider: "AWS Textract", accuracy: 77.2 },
  { provider: "Google Vision", accuracy: 54.5 },
  { provider: "Azure Vision", accuracy: 51.7 },
];

export default function BenchmarkAccuracyChart() {
  return (
    <Card className="border border-border bg-card/80 shadow-sm backdrop-blur-md" data-animate="stagger">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          Handwritten Text Recognition Accuracy
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on 10,000+ real-world samples
        </p>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={{
            accuracy: {
              label: "Accuracy",
              color: "var(--primary)",
            },
          }}
          className="h-[300px] w-full"
        >
          <BarChart
            data={benchmarkData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="provider"
              tickLine={false}
              axisLine
              tickMargin={10}
              angle={0}
              textAnchor="middle"
            />
            <YAxis
              tickLine={false}
              axisLine
              tickMargin={10}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              label={{ value: "Accuracy (%)", angle: -90, position: "insideLeft" }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="accuracy"
              fill="var(--primary)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>

        <div className="mt-6 border-t border-border/50 pt-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <img src="/site-icons/io/table.svg" alt="" className="h-5 w-5" />
            <span>Tested on IAM Handwriting Database v3.0</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
