'use client';

import * as React from 'react';
import { Pie, PieChart, Label } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useApplicationStatus } from '../hooks/use-dashboard-data';
import { Skeleton } from '@/shared/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';

export function RevenueChart() {
    const { data, isLoading } = useApplicationStatus();

    const totalApplications = React.useMemo(() => {
        return data?.reduce((acc, curr) => acc + curr.value, 0) ?? 0;
    }, [data]);

    if (isLoading) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }

    const chartConfig = {
        value: {
            label: "Applications",
        },
        Sent: {
            label: "Sent",
            color: "hsl(var(--primary))",
        },
        'In Review': {
            label: "In Review",
            color: "hsl(var(--chart-1))",
        },
        Approved: {
            label: "Approved",
            color: "hsl(var(--chart-2))",
        },
        Declined: {
            label: "Declined",
            color: "hsl(var(--destructive))",
        },
    } as any;

    return (
        <Card className="col-span-1 lg:col-span-3 border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-lg font-bold">Applications Overview</CardTitle>
                <CardDescription>Status distribution of active applications</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={data?.map(item => ({
                                ...item,
                                fill: chartConfig[item.name as keyof typeof chartConfig]?.color || "var(--color-primary)"
                            }))}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {totalApplications.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Total Apps
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
