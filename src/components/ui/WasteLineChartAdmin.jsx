'use client';

import { useState, useRef, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { ChevronLeft } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';

// Sample hourly data generator – creates 24 hourly data points for a given date.
const generateHourlyData = (date, bins) => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hourStr = i < 10 ? `0${i}:00` : `${i}:00`;
    const hourData = {
      hour: hourStr,
      date: `${date} ${hourStr}`,
    };

    bins.forEach((bin) => {
      // Calculate base value from first reading and adjust for work hours.
      const baseValue = bin.data[0].weight * 0.05;
      const workHourMultiplier = i >= 8 && i <= 17 ? 1.5 : 0.7;
      const randomVariation = Math.random() * 0.4 + 0.8;
      hourData[bin.binName] = Number((baseValue * workHourMultiplier * randomVariation).toFixed(2));
    });

    hours.push(hourData);
  }
  return hours;
};

// Custom tooltip for the chart.
const CustomTooltip = ({ active, payload, label, theme }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className={`p-3 rounded-lg shadow-md border ${
        theme === 'dark' ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200'
      }`}
    >
      <p className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
              {entry.name}:
            </span>
            <span className="font-medium">{entry.value} kg</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom legend for the chart.
const CustomLegend = ({ payload, theme }) => (
  <div className="flex flex-wrap gap-4 justify-center mt-2">
    {payload.map((entry, index) => (
      <div key={index} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
          {entry.value}
        </span>
      </div>
    ))}
  </div>
);

// Main WasteLineChart component, receiving dateFilter as a prop along with trendData, loading and error.
export default function EnhancedWasteChart({ trendData, loading, error, dateFilter }) {
  const { theme } = useTheme();
  const [zoomData, setZoomData] = useState(null);
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [isZooming, setIsZooming] = useState(false);
  const chartRef = useRef(null);

  // Determine if the current filter is "today" to set XAxis data key and formatting.
  const isToday = dateFilter === 'today';

  // Helper to get color for bin lines.
  const getBinColor = (index) => {
    const colors = [
      'hsl(var(--chart-1))', // Primary
      'hsl(var(--chart-2))', // Secondary
      'hsl(var(--chart-3))', // Tertiary
      'hsl(var(--chart-4))', // Quaternary
      'hsl(var(--chart-5))', // Quinary
    ];
    return colors[index % colors.length];
  };

  // Zoom in: Generate hourly data for the selected date range.
  const handleZoomIn = () => {
    if (refAreaLeft === refAreaRight || refAreaRight === '') {
      setIsZooming(false);
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }
    let left = refAreaLeft;
    let right = refAreaRight;
    if (refAreaLeft > refAreaRight) {
      left = refAreaRight;
      right = refAreaLeft;
    }
    // Find selected date from trend data.
    const selectedDate = trendData
      .find((bin) => bin.data.some((point) => point.date === left || point.date === right))
      ?.data.find((point) => point.date === left || point.date === right)?.date;
    if (selectedDate) {
      const hourlyData = generateHourlyData(selectedDate.split(' ')[0], trendData);
      setZoomData(hourlyData);
    }
    setIsZooming(false);
    setRefAreaLeft('');
    setRefAreaRight('');
  };

  const handleZoomOut = () => {
    setZoomData(null);
  };

  const handleMouseDown = useCallback((e) => {
    if (!e || !e.activeLabel) return;
    setIsZooming(true);
    setRefAreaLeft(e.activeLabel);
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isZooming || !e || !e.activeLabel) return;
      setRefAreaRight(e.activeLabel);
    },
    [isZooming],
  );

  const handleMouseUp = useCallback(() => {
    if (isZooming) {
      handleZoomIn();
    }
  }, [isZooming, refAreaLeft, refAreaRight]);

  // Prepare data for rendering: use zoomData if available, else flatten trendData.
  const chartData = zoomData || trendData.flatMap((bin) => bin.data);

  return (
    <div className="h-80 relative">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <p>Loading trend data...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <>
          {zoomData && (
            <button
              onClick={handleZoomOut}
              className={`absolute top-0 left-0 z-10 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-sm ${
                theme === 'dark'
                  ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white'
                  : 'bg-slate-200/70 hover:bg-slate-300/70 text-slate-800'
              }`}
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              ref={chartRef}
              data={chartData}
              margin={{ top: 20, right: 20, left: 5, bottom: 20 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <CartesianGrid
                horizontal={true}
                vertical={false}
                strokeDasharray="3 3"
                stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
              />
              <XAxis
                // Use "hour" for today (hourly data) or "date" for other filters.
                dataKey={isToday ? 'hour' : 'date'}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={12}
                stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'}
                tickFormatter={(value) => {
                  if (isToday) {
                    // For hourly data, return as is (e.g., "07:00")
                    return value;
                  } else {
                    // For daily data, format the date
                    const dateObj = new Date(value);
                    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }
                }}
                interval={0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={12}
                stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'}
                tickCount={5}
              />
              <Tooltip
                content={<CustomTooltip theme={theme} />}
                cursor={{
                  stroke: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  strokeWidth: 1,
                  strokeDasharray: '5 5',
                }}
              />
              <Legend content={<CustomLegend theme={theme} />} verticalAlign="bottom" height={36} />
              {zoomData
                ? // Render multiple lines for hourly zoomed data.
                  trendData.map((bin, index) => (
                    <Line
                      key={bin.binName}
                      type="monotone"
                      dataKey={bin.binName}
                      name={bin.binName}
                      stroke={getBinColor(index)}
                      strokeWidth={2}
                      dot={{ r: 3, fill: getBinColor(index), strokeWidth: 0 }}
                      activeDot={{
                        r: 6,
                        stroke: theme === 'dark' ? '#1e293b' : '#ffffff',
                        strokeWidth: 2,
                      }}
                    />
                  ))
                : // Render lines for daily aggregated data.
                  trendData.map((bin, index) => (
                    <Line
                      key={bin.binName}
                      type="monotone"
                      dataKey="weight"
                      data={bin.data}
                      name={bin.binName}
                      stroke={getBinColor(index)}
                      strokeWidth={2.5}
                      dot={{ r: 0 }}
                      activeDot={{
                        r: 6,
                        stroke: theme === 'dark' ? '#1e293b' : '#ffffff',
                        strokeWidth: 2,
                      }}
                    />
                  ))}
              {isZooming && refAreaLeft && refAreaRight && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  strokeOpacity={0.3}
                  fill={theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
