"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function MetricsChart({ data, selectedMetric }) {
    const chartData = data.map(({ model, metrics }) => ({
        model,
        [selectedMetric]: metrics[selectedMetric] * 100,
    }))

    const metricColor = {
        answerCorrectness: "hsl(var(--chart-1))",
        answerRelevancy: "hsl(var(--chart-2))",
        answerSimilarity: "hsl(var(--chart-3))",
        faithfulness: "hsl(var(--chart-4))",
    }

    return (
        <Card className="w-full mt-8">
            <CardHeader>
                <CardTitle>{selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Comparison</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={{
                        [selectedMetric]: {
                            label: selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1),
                            color: metricColor[selectedMetric],
                        },
                    }}
                    className="h-[400px]"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="model" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line type="monotone" dataKey={selectedMetric} stroke={`var(--color-${selectedMetric})`} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

