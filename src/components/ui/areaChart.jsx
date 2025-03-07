"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/Chart";

export default function DualLineAreaChart({
  title,
  description,
  branchId,
  filter,
  rateKey,
  targetKey,
}) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hiddenSeries, setHiddenSeries] = useState({});

  const fetchChartData = useCallback(async () => {
    if (!branchId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `/api/v1/analytics/dailyDiversionRecycling?branchId=${branchId}&filter=${filter}`,
        { withCredentials: true }
      );
      setChartData(response.data.data);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError("Failed to fetch chart data");
    } finally {
      setIsLoading(false);
    }
  }, [branchId, filter]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const config = {
    [rateKey]: {
      label: "Current Rate",
      color: "hsl(var(--chart-1))",
    },
    [targetKey]: {
      label: "Target Rate",
      color: "hsl(var(--chart-2))",
    },
  };

  const handleLegendClick = (dataKey) => {
    setHiddenSeries((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

  return (
    <Card className="h-[450px]">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            Loading chart...
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <ChartContainer config={config} className="h-[300px]">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id={`gradient-${rateKey}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={config[rateKey].color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={config[rateKey].color}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient
                    id={`gradient-${targetKey}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={config[targetKey].color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={config[targetKey].color}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                {!hiddenSeries[rateKey] && (
                  <Area
                    type="natural"
                    dataKey={rateKey}
                    stroke={config[rateKey].color}
                    fillOpacity={1}
                    fill={`url(#gradient-${rateKey})`}
                    stackId="a"
                  />
                )}
                {!hiddenSeries[targetKey] && (
                  <Area
                    type="natural"
                    dataKey={targetKey}
                    stroke={config[targetKey].color}
                    fillOpacity={1}
                    fill={`url(#gradient-${targetKey})`}
                    stackId="a"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4">
              <ChartLegend
                content={
                  <ChartLegendContent
                    payload={[
                      {
                        value: config[rateKey].label,
                        color: config[rateKey].color,
                        dataKey: rateKey,
                      },
                      {
                        value: config[targetKey].label,
                        color: config[targetKey].color,
                        dataKey: targetKey,
                      },
                    ]}
                    onLegendClick={handleLegendClick}
                  />
                }
              />
            </div>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
