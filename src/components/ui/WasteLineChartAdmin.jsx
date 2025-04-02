'use client';

import { useState, useEffect, useCallback } from 'react';
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

const CustomTooltip = ({ active, payload, label, theme, dateFilter }) => {
  if (!active || !payload || !payload.length) return null;

  let formattedLabel = label;
  if (dateFilter === 'today') {
    // Convert 24-hour format to AM/PM
    const hour = Number.parseInt(label, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert 0 to 12
    formattedLabel = `${hour12} ${ampm}`;
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
              kg
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomLegend = ({ payload, theme, hiddenLines, onLegendClick }) => (
  <div className="flex flex-wrap gap-4 justify-center mt-[-12px]">
    {payload.map((entry, index) => (
      <div
        key={index}
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => onLegendClick(entry.value)}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{
            backgroundColor: entry.color,
            opacity: hiddenLines[entry.value] ? 0.3 : 1,
          }}
        />
        <span
          className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} ${
            hiddenLines[entry.value] ? 'line-through opacity-50' : ''
          }`}
        >
          {entry.value}
        </span>
      </div>
    ))}
  </div>
);

const getBinColor = (index) => {
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];
  return colors[index % colors.length];
};

export default function AdminWasteLineChart({ trendData, loading, error, dateFilter }) {
  const { theme } = useTheme();

  const [transformedData, setTransformedData] = useState([]);
  const [zoomData, setZoomData] = useState(null);
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [isZooming, setIsZooming] = useState(false);
  const [hiddenLines, setHiddenLines] = useState({});

  // Update transformation logic based on the new structure:
  useEffect(() => {
    const transformed = trendData.map((record) => {
      // record should be: { time, data: { binType1: weight1, binType2: weight2, ... } }
      return { time: record.time, ...record.data };
    });
    console.log('WasteLineChartAdmin transformed data:', transformed);
    setTransformedData(transformed);
  }, [trendData]);

  const handleLegendClick = useCallback((dataKey) => {
    setHiddenLines((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  }, []);

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
    const selectedData = transformedData.filter((d) => d.time >= left && d.time <= right);
    if (selectedData.length) {
      setZoomData(selectedData);
    }
    setIsZooming(false);
    setRefAreaLeft('');
    setRefAreaRight('');
  };

  const handleZoomOut = () => {
    setZoomData(null);
  };

  const handleMouseDown = (e) => {
    if (!e || !e.activeLabel) return;
    setIsZooming(true);
    setRefAreaLeft(e.activeLabel);
  };

  const handleMouseMove = (e) => {
    if (!isZooming || !e || !e.activeLabel) return;
    setRefAreaRight(e.activeLabel);
  };

  const handleMouseUp = () => {
    if (isZooming) {
      handleZoomIn();
    }
  };

  const xAxisDataKey = 'time';
  const dataToRender = zoomData || transformedData;

  return (
    <div className="w-full h-80 relative">
      {error ? (
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
              key={`${dateFilter}`}
              data={dataToRender}
              margin={{ top: 20, right: 20, left: 5, bottom: 20 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <CartesianGrid
                horizontal={true}
                vertical={false}
                strokeDasharray="3 3"
                stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
              />
              <XAxis
                dataKey={xAxisDataKey}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={12}
                stroke={theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'}
                tickFormatter={(value) => {
                  if (dateFilter === 'today') {
                    // Convert 24-hour format to AM/PM
                    const hour = Number.parseInt(value, 10);
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const hour12 = hour % 12 || 12; // Convert 0 to 12
                    return `${hour12} ${ampm}`;
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
                tickCount={5}
                tick={{ style: { pointerEvents: 'none', userSelect: 'none' } }}
              />

              <Tooltip
                content={<CustomTooltip theme={theme} dateFilter={dateFilter} />}
                cursor={{
                  stroke: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  strokeWidth: 1,
                  strokeDasharray: '5 5',
                }}
              />
              <Legend
                content={
                  <CustomLegend
                    theme={theme}
                    hiddenLines={hiddenLines}
                    onLegendClick={handleLegendClick}
                  />
                }
                verticalAlign="bottom"
                height={36}
              />
              {dataToRender.length > 0 &&
                Object.keys(dataToRender[0])
                  .filter((key) => key !== 'time')
                  .map((binType, index) => (
                    <Line
                      key={binType}
                      type="monotone"
                      dataKey={binType}
                      name={binType}
                      stroke={getBinColor(index)}
                      strokeWidth={2.5}
                      dot={{ r: 0 }}
                      activeDot={{
                        r: 6,
                        stroke: theme === 'dark' ? '#1e293b' : '#ffffff',
                        strokeWidth: 2,
                      }}
                      hide={hiddenLines[binType]}
                      opacity={hiddenLines[binType] ? 0.3 : 1}
                    />
                  ))}
              {isZooming && refAreaLeft && refAreaRight && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  strokeOpacity={0.3}
                  fill={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
