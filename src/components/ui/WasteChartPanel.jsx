import React from 'react';
import WasteLineChart from './WasteLineChart';
import { transformDataForChart, getColorForBin } from '../../utils/chartTransforms';

export default function WasteChartPanel({ bins, trendComparison, isLoading, error }) {
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  if (error) return <div className="text-red-500">{error}</div>;

  const chartData = transformDataForChart(bins);
  const colorConfig = bins.reduce((cfg, bin) => {
    cfg[bin.binName] = { color: getColorForBin(bin.binName) };
    return cfg;
  }, {});

  return (
    <WasteLineChart
      bins={bins}
      chartData={chartData}
      colorConfig={colorConfig}
      trendComparison={trendComparison}
      isLoading={false}
    />
  );
}
