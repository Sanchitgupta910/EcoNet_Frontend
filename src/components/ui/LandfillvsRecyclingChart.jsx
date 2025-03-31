'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/components/ui/theme-provider';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, theme, dateFilter }) => {
  if (!active || !payload || !payload.length) return null;

  // Format label: if filter is today, assume label is hour (e.g., 10 becomes "10:00 hrs").
  // Otherwise, format as "day Month" (e.g., "25 Mar").
  let formattedLabel = label;
  if (dateFilter === 'today') {
    formattedLabel = `${label}:00 hrs`;
  } else {
    const date = new Date(label);
    const day = date.getDate();
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[date.getMonth()];
    formattedLabel = `${day} ${month}`;
  }

  return (
    <div
      className={`p-3 rounded-lg shadow-md border ${
        theme === 'dark' ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200'
      }`}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <p className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
        {formattedLabel}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
              {entry.name}:
            </span>
            <span className="font-medium">
              {typeof entry.value === 'number'
                ? entry.value.toFixed(2)
                : Number(entry.value).toFixed(2)}{' '}
              %
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom legend component
const CustomLegend = ({ payload, theme, visibleSeries, onToggleSeries }) => (
  <div className="flex justify-center gap-6 mt-2">
    {payload.map((entry, index) => (
      <div
        key={index}
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => onToggleSeries(entry.dataKey)}
      >
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
        <span
          className={`text-sm  ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
          } ${!visibleSeries[entry.dataKey] ? 'line-through opacity-50' : ''}`}
        >
          {entry.value}
        </span>
      </div>
    ))}
  </div>
);

const LandfillRecyclingChart = ({
  data,
  loading = false,
  error = null,
  dateFilter = 'thisMonth',
}) => {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState([]);
  const [hoveredData, setHoveredData] = useState(null);
  const tooltipRef = useRef(null);
  const [visibleSeries, setVisibleSeries] = useState({
    landfillDiversionPercentage: true,
    recyclingRate: true,
  });

  // Update chart data when the data prop changes.
  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
    } else {
      setChartData([]);
    }
  }, [data]);

  // Determine X-axis key based on the date filter: 'time' for "today", 'day' otherwise.
  const xAxisDataKey = dateFilter === 'today' ? 'time' : 'day';

  // Function to toggle visibility of a data series
  const toggleSeriesVisibility = (dataKey) => {
    setVisibleSeries((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

  return (
    <div className="w-full h-[270px] relative">
      {loading ? (
        <div className="h-full flex justify-center items-center">
          <p
            className={`animate-pulse text-sm ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Loading chart data...
          </p>
        </div>
      ) : error ? (
        <div className="h-full flex justify-center items-center">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onMouseMove={(e) => {
              if (e && e.activePayload) {
                setHoveredData(e.activePayload[0]?.payload);
              }
            }}
            onMouseLeave={() => setHoveredData(null)}
          >
            <defs>
              <linearGradient id="landfillDiversionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme === 'dark' ? '#3b82f6' : '#60a5fa'}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={theme === 'dark' ? '#3b82f6' : '#60a5fa'}
                  stopOpacity={0.2}
                />
              </linearGradient>
              <linearGradient id="recyclingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme === 'dark' ? '#10b981' : '#34d399'}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={theme === 'dark' ? '#10b981' : '#34d399'}
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey={xAxisDataKey}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={12}
              stroke={theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'}
              tickFormatter={(value) => {
                if (dateFilter === 'today') {
                  return `${value}:00 hrs`;
                } else {
                  const date = new Date(value);
                  const day = date.getDate();
                  const monthNames = [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                  ];
                  const month = monthNames[date.getMonth()];
                  return `${day} ${month}`;
                }
              }}
              tick={{ style: { pointerEvents: 'none', userSelect: 'none' } }}
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={12}
              stroke={theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'}
              tickFormatter={(value) => `${value}%`}
              dx={-10}
            />
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
            />
            <Tooltip content={<CustomTooltip theme={theme} dateFilter={dateFilter} />} />
            <Legend
              content={
                <CustomLegend
                  theme={theme}
                  visibleSeries={visibleSeries}
                  onToggleSeries={toggleSeriesVisibility}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="landfillDiversionPercentage"
              name="Landfill Diversion"
              stroke={theme === 'dark' ? '#3b82f6' : '#2563eb'}
              fillOpacity={visibleSeries.landfillDiversionPercentage ? 1 : 0}
              strokeOpacity={visibleSeries.landfillDiversionPercentage ? 1 : 0}
              fill="url(#landfillDiversionGradient)"
              strokeWidth={2}
              activeDot={{
                r: 6,
                strokeWidth: 0,
                opacity: visibleSeries.landfillDiversionPercentage ? 1 : 0,
              }}
              hide={!visibleSeries.landfillDiversionPercentage}
            />
            <Area
              type="monotone"
              dataKey="recyclingRate"
              name="Recycling"
              stroke={theme === 'dark' ? '#10b981' : '#059669'}
              fillOpacity={visibleSeries.recyclingRate ? 0.8 : 0}
              strokeOpacity={visibleSeries.recyclingRate ? 1 : 0}
              fill="url(#recyclingGradient)"
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 0, opacity: visibleSeries.recyclingRate ? 1 : 0 }}
              hide={!visibleSeries.recyclingRate}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default LandfillRecyclingChart;
