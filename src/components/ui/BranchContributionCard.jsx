import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';

export default function BranchContributionCard({ percentage, branchName }) {
  return (
    <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80 flex flex-col h-full">
      <CardHeader className="pb-2 border-b border-gray-100/50">
        <CardTitle className="text-base font-medium text-gray-800">Branch Contribution</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Relative to total company waste
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
              className="text-blue-500"
              strokeWidth="8"
              strokeDasharray={`${percentage * 2.51} 251`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
          </div>
        </div>
        <p className="text-center text-xs text-gray-600">
          {branchName} contributes {percentage}% of the total waste
        </p>
      </CardContent>
    </Card>
  );
}
