import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DiversionCard({ data, loading }) {
  if (loading)
    return (
      <Card className="shadow-sm border bg-white flex flex-col h-full">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full" />
        </CardContent>
      </Card>
    );

  const { diversionPercentage, trendValue } = data || {};
  return (
    <Card className="shadow-sm border bg-white flex flex-col h-full">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-base font-medium text-gray-800">Landfill Diversion</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Waste diverted from landfill (Today)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-2">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-green-500"
              strokeWidth="8"
              strokeDasharray={`${diversionPercentage * 2.51} 251`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-800">
              {diversionPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <div
          className="flex items-center text-xs font-medium"
          style={{ color: trendValue > 0 ? 'green' : trendValue < 0 ? 'red' : 'gray' }}
        >
          {trendValue > 0 ? (
            <>
              <ArrowUpRight className="h-4 w-4 mr-1 text-green-600" />
              {trendValue}% increase
            </>
          ) : trendValue < 0 ? (
            <>
              <ArrowDownRight className="h-4 w-4 mr-1 text-red-600" />
              {Math.abs(trendValue)}% decrease
            </>
          ) : (
            <span>No change</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
