import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

export default function DualLineAreaChart({ title, branchId, filter, rateKey, targetKey }) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">Loading chart...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <ChartContainer config={config} className="h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                
                  <linearGradient id={`gradient-${rateKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2}/>
                  </linearGradient>
                  {/* <linearGradient id={`gradient-${targetKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2}/>
                  </linearGradient> */}
                  
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area type="monotone" dataKey={rateKey} stroke="hsl(var(--chart-1))" fillOpacity={1} fill={`url(#gradient-${rateKey})`} />
                <Area type="monotone" dataKey={targetKey} stroke="hsl(var(--chart-2))" fillOpacity={1} fill={`url(#gradient-${targetKey})`} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}