import React from 'react';
import { Card, CardContent } from './Card';
import { Recycle } from 'lucide-react';

const getColors = (name) => {
  const nameLower = (name || '').toLowerCase();
  if (nameLower.includes('general') || nameLower.includes('waste')) {
    return {
      border: 'border-rose-200',
      bg: 'bg-gradient-to-b from-white to-rose-50',
      accent: 'bg-rose-500',
      text: 'text-rose-700',
      indicator: 'bg-rose-100',
      muted: 'text-rose-600/70',
    };
  } else if (nameLower.includes('commingled') || nameLower.includes('mixed')) {
    return {
      border: 'border-amber-200',
      bg: 'bg-gradient-to-b from-white to-amber-50',
      accent: 'bg-amber-500',
      text: 'text-amber-700',
      indicator: 'bg-amber-100',
      muted: 'text-amber-600/70',
    };
  } else if (nameLower.includes('organic')) {
    return {
      border: 'border-emerald-200',
      bg: 'bg-gradient-to-b from-white to-emerald-50',
      accent: 'bg-emerald-500',
      text: 'text-emerald-700',
      indicator: 'bg-emerald-100',
      muted: 'text-emerald-600/70',
    };
  } else if (nameLower.includes('paper') || nameLower.includes('cardboard')) {
    return {
      border: 'border-blue-200',
      bg: 'bg-gradient-to-b from-white to-blue-50',
      accent: 'bg-blue-500',
      text: 'text-blue-700',
      indicator: 'bg-blue-100',
      muted: 'text-blue-600/70',
    };
  } else if (nameLower.includes('glass')) {
    return {
      border: 'border-purple-200',
      bg: 'bg-gradient-to-b from-white to-purple-50',
      accent: 'bg-purple-500',
      text: 'text-purple-700',
      indicator: 'bg-purple-100',
      muted: 'text-purple-600/70',
    };
  } else {
    return {
      border: 'border-sky-200',
      bg: 'bg-gradient-to-b from-white to-sky-50',
      accent: 'bg-sky-500',
      text: 'text-sky-700',
      indicator: 'bg-sky-100',
      muted: 'text-sky-600/70',
    };
  }
};

export default function BinStatusCard({ binName, currentWeight, isActive, binCapacity }) {
  const colors = getColors(binName);
  const icon = <Recycle className="h-5 w-5 text-white" />;

  return (
    <Card
      className={`${colors.bg} ${colors.border} border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <h3 className={`text-base font-medium ${colors.text}`}>{binName}</h3>
            {isActive && (
              <div className="ml-2 h-2 w-2 bg-green-500 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.5)] animate-pulse" />
            )}
          </div>
          <div
            className={`${colors.accent} h-8 w-8 rounded-md flex items-center justify-center shadow-sm`}
          >
            {icon}
          </div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`w-0.5 h-6 rounded-full ${colors.accent} mr-2`} />
            <div>
              <p className="text-xs text-gray-500">Capacity</p>
              <p className={`text-sm font-medium ${colors.text}`}>{binCapacity}L</p>
            </div>
          </div>
        </div>
        <div className={`${colors.indicator} p-3 rounded-md mt-1`}>
          <div className="flex items-baseline justify-between">
            <p className={`text-xs ${colors.muted}`}>Current Weight</p>
            <div className="flex items-baseline">
              <span className={`text-2xl font-bold tracking-tight ${colors.text}`}>
                {currentWeight.toFixed(2)}
              </span>
              <span className="ml-1 text-sm text-gray-500">Kgs</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
