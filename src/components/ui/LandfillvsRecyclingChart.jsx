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
  CartesianGrid
} from 'recharts';

// Sample data - replace with your actual API data
const sampleData = [
  { month: 'Jan', landfillDiversion: 30, recycling: 12 },
  { month: 'Feb', landfillDiversion: 40, recycling: 30 },
  { month: 'Mar', landfillDiversion: 28, recycling: 45 },
  { month: 'Apr', landfillDiversion: 50, recycling: 32 },
  { month: 'May', landfillDiversion: 42, recycling: 35 },
  { month: 'Jun', landfillDiversion: 105, recycling: 52 },
  { month: 'Jul', landfillDiversion: 100, recycling: 40 },
];

const LandfillRecyclingChart = ({ data = sampleData, loading = false, error = null, dateFilter = 'thisMonth' }) => {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState(data);
  const [hoveredData, setHoveredData] = useState(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
    }
  }, [data]);

  // Custom tooltip that follows cursor
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div 
        ref={tooltipRef}
        className={`p-3 rounded-lg shadow-lg border ${
          theme === 'dark' 
            ? 'bg-slate-800/95 border-slate-700/50 text-white' 
            : 'bg-white/95 border-slate-200/70 text-slate-800'
        }`}
        style={{
          backdropFilter: 'blur(8px)',
        }}
      >
        <p className="font-medium mb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-sm">
                <span className="font-medium">{entry.name}: </span>
                <span>{entry.value.toFixed(1)}%</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Custom legend that's more stylish
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex justify-center gap-6 mt-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <div className={`animate-pulse text-sm ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Loading chart data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
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
            {/* Gradient for Landfill Diversion */}
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
            
            {/* Gradient for Recycling */}
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
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: theme === 'dark' ? '#94a3b8' : '#64748b',
              fontSize: 12 
            }}
            dy={10}
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: theme === 'dark' ? '#94a3b8' : '#64748b',
              fontSize: 12 
            }}
            tickFormatter={(value) => `${value}%`}
            dx={-10}
          />
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} 
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend content={<CustomLegend />} />
          
          <Area
            type="monotone"
            dataKey="landfillDiversion"
            name="Landfill Diversion"
            stroke={theme === 'dark' ? '#3b82f6' : '#2563eb'}
            fillOpacity={1}
            fill="url(#landfillDiversionGradient)"
            strokeWidth={2}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          
          <Area
            type="monotone"
            dataKey="recycling"
            name="Recycling"
            stroke={theme === 'dark' ? '#10b981' : '#059669'}
            fillOpacity={0.8}
            fill="url(#recyclingGradient)"
            strokeWidth={2}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Optional: Add a summary of the current data below the chart */}
      {hoveredData && (
        <div className={`text-xs mt-2 text-center ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {hoveredData.month}: Landfill Diversion {hoveredData.landfillDiversion}%, 
          Recycling {hoveredData.recycling}%
        </div>
      )}
    </div>
  );
};

export default LandfillRecyclingChart;
