'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Presentational component for waste trend chart.
export default function WasteLineChart({
  bins = [],
  chartData = [],
  colorConfig = {},
  trendComparison = null,
  isLoading = false,
  error = null,
}) {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  // Force a remount of the chart when window resizes
  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <Card className="shadow-md border border-gray-100 bg-white/95 flex flex-col h-full">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-medium text-gray-800">Waste Trend</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Daily waste generation by bin type
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || chartData.length === 0 || bins.length === 0) {
    return (
      <Card className="shadow-md border border-gray-100 bg-white/95 flex flex-col h-full">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-medium text-gray-800">Waste Trend</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Daily waste generation by bin type
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 gap-2">
          <Info className="h-10 w-10 text-gray-300" />
          <p className="text-gray-500 text-sm">{error || 'No trend data available'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border border-gray-100 bg-white/95 flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="text-base font-medium text-gray-800">Total Waste Recorded</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Daily waste generation by bin type
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-5 flex flex-col">
        {/* Chart Container */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%" key={windowHeight}>
            <RechartsLineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 5, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => {
                  try {
                    return format(parseISO(value), 'dd MMM');
                  } catch {
                    return value;
                  }
                }}
                fontSize={12}
                stroke="#9CA3AF"
                interval={0}
              />
              <YAxis
                tickFormatter={(value) => `${value}kg`}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={12}
                stroke="#9CA3AF"
                domain={['auto', 'auto']}
                tickCount={5}
              />
              <RechartsTooltip
                content={(props) => <CustomTooltip {...props} colorConfig={colorConfig} />}
                cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              {bins.map((bin) => (
                <Line
                  key={bin._id}
                  type="monotone"
                  dataKey={bin.binName}
                  stroke={colorConfig[bin.binName]?.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: colorConfig[bin.binName]?.color,
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
        {/* Legend & Trend */}
        <div className="mt-4 flex items-center justify-between px-2">
          {/* Legend */}
          <div className="flex flex-wrap gap-4">
            {bins.map((bin) => (
              <div key={bin._id} className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: colorConfig[bin.binName]?.color }}
                />
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                  {bin.binName}
                </span>
              </div>
            ))}
          </div>
          {/* Trend Comparison */}
          {trendComparison?.message && (
            <div className="px-2">
              <p className="text-sm font-medium text-gray-700">{trendComparison.message}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// CustomTooltip definition
function CustomTooltip({ active, payload, label, colorConfig }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100 max-w-xs">
        <p className="text-sm font-medium text-gray-900 mb-2">
          {format(parseISO(label), 'dd MMM yyyy')}
        </p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs font-medium">{entry.name}</span>
              </div>
              <span className="text-xs font-semibold ml-4">{entry.value.toFixed(2)}kg</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}
