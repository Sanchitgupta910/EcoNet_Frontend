'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Transform API data for the chart.
// Expects each bin object to have a "data" array of daily readings.
const transformDataForChart = (bins) => {
  if (!bins || bins.length === 0) return [];
  const dateMap = new Map();
  bins.forEach((bin) => {
    (bin.data || []).forEach((reading) => {
      if (!dateMap.has(reading.date)) {
        dateMap.set(reading.date, { date: reading.date });
      }
      // Use the bin's name as the key
      const dateEntry = dateMap.get(reading.date);
      dateEntry[bin.binName] = reading.weight;
    });
  });
  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
};

// Generate a color configuration based on bin names using Tailwind colors.
const getColorForBin = (binName) => {
  const nameLower = binName.toLowerCase();
  if (nameLower.includes('general') || nameLower.includes('waste')) {
    return '#F43F5E'; // Tailwind rose-500
  } else if (nameLower.includes('commingled') || nameLower.includes('mixed')) {
    return '#F59E0B'; // Tailwind amber-500
  } else if (nameLower.includes('organic')) {
    return '#10B981'; // Tailwind emerald-500
  } else if (nameLower.includes('paper') || nameLower.includes('cardboard')) {
    return '#3B82F6'; // Tailwind blue-500
  } else if (nameLower.includes('glass')) {
    return '#8B5CF6'; // Tailwind purple-500
  } else {
    return '#0EA5E9'; // Tailwind sky-500 (default)
  }
};

const generateColorConfig = (bins) => {
  const colorMap = {};
  bins.forEach((bin) => {
    colorMap[bin.binName] = {
      label: bin.binName,
      color: getColorForBin(bin.binName),
    };
  });
  return colorMap;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, colorConfig }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100 max-w-xs">
        <p className="text-sm font-medium text-gray-900 mb-2">
          {format(parseISO(label), 'dd MMM yyyy')}
        </p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center justify-between">
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
};

export default function WasteLineChart({ branchId }) {
  const [chartData, setChartData] = useState([]);
  const [bins, setBins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [colorConfig, setColorConfig] = useState({});
  const [trendComparison, setTrendComparison] = useState(null);

  useEffect(() => {
    const fetchWasteData = async () => {
      try {
        setIsLoading(true);
        // Pass branchId as query parameter to filter bins by branch.
        const response = await axios.get(`/api/v1/analytics/wasteLast7Days?branchId=${branchId}`, {
          withCredentials: true,
        });
        console.log('Raw API data:', response.data.data);

        if (response.data.success) {
          // Assume API now returns only bins for the branch.
          const binsData = response.data.data.filter((bin) => bin.data && bin.data.length > 0);
          setBins(binsData);
          setChartData(transformDataForChart(binsData));
          setColorConfig(generateColorConfig(binsData));
        } else {
          setError('Failed to fetch waste data');
        }
      } catch (err) {
        console.error('Error fetching waste data:', err);
        setError('Error fetching waste data');
        // Fallback data for preview
        const fallbackBins = [
          {
            _id: '1',
            binName: 'Landfill',
            data: Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              weight: 1.5 + Math.random() * 0.2,
            })),
          },
          {
            _id: '2',
            binName: 'Mixed recycling',
            data: Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              weight: 1.4 + Math.random() * 0.15,
            })),
          },
          {
            _id: '3',
            binName: 'Comingled',
            data: Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              weight: 1.3 + Math.random() * 0.1,
            })),
          },
        ];
        setBins(fallbackBins);
        setChartData(transformDataForChart(fallbackBins));
        setColorConfig(generateColorConfig(fallbackBins));
      } finally {
        setIsLoading(false);
      }
    };

    if (branchId) {
      fetchWasteData();
    }
  }, [branchId]);

  // Fetch trend comparison data
  useEffect(() => {
    const fetchTrendComparison = async () => {
      if (!branchId) return;
      try {
        const response = await axios.get(
          `/api/v1/analytics/wasteTrendComparison?branchId=${branchId}`,
          { withCredentials: true },
        );
        if (response.data.success) {
          setTrendComparison(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching trend comparison:', err);
      }
    };
    fetchTrendComparison();
  }, [branchId]);

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

  if (error || chartData.length === 0) {
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
    <Card className="shadow-md border border-gray-100 bg-white/95 flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="text-base font-medium text-gray-800">Total Waste Recorded</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Daily waste generation by bin type
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-5">
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 5, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => {
                  try {
                    return format(parseISO(value), 'dd MMM');
                  } catch (e) {
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
                content={<CustomTooltip colorConfig={colorConfig} />}
                cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              {bins.map((bin) => (
                <Line
                  key={bin._id}
                  type="monotone"
                  dataKey={bin.binName}
                  stroke={colorConfig[bin.binName]?.color || getColorForBin(bin.binName)}
                  strokeWidth={2.5}
                  dot={{ r: 0, strokeWidth: 0 }}
                  activeDot={{
                    r: 6,
                    fill: colorConfig[bin.binName]?.color || getColorForBin(bin.binName),
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Combined Legend Row */}
          <div className="mt-4 flex items-center justify-between px-2">
            {/* Bin Legend on the left */}
            <div className="flex flex-wrap gap-4">
              {bins.map((bin) => (
                <div
                  key={bin._id}
                  className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full"
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{
                      backgroundColor:
                        colorConfig[bin.binName]?.color || getColorForBin(bin.binName),
                    }}
                  ></div>
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {bin.binName}
                  </span>
                </div>
              ))}
            </div>
            {/* Trend Comparison Sentence on the right */}
            {trendComparison && (
              <div className="flex items-center">
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                  This week, total waste was {trendComparison.thisWeekWaste} KG, which is{' '}
                  {trendComparison.percentageChange}%
                  {trendComparison.trend === 'higher' ? (
                    <ArrowUpRight className="inline-block h-4 w-4 text-emerald-600 mx-1" />
                  ) : trendComparison.trend === 'lower' ? (
                    <ArrowDownRight className="inline-block h-4 w-4 text-rose-600 mx-1" />
                  ) : (
                    <span className="mx-1">equal to</span>
                  )}{' '}
                  than last week ({trendComparison.lastWeekWaste} KG).
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
