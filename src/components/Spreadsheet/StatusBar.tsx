// src/components/Spreadsheet/StatusBar.tsx

import React from 'react';

interface CalculationResults {
  sum: number;
  average: number;
  count: number;
}

interface StatusBarProps {
  calculations: CalculationResults | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ calculations }) => {
  const formatNumber = (num: number) => {
    // Show up to 2 decimal places, but only if necessary
    return Number(num.toFixed(2)).toLocaleString();
  };

  return (
    <div className="flex items-center justify-end h-7 border-t bg-gray-50 px-4 text-xs text-gray-600 space-x-6">
      {calculations && calculations.count > 1 && (
        <>
          <div>
            Sum: <span className="font-semibold">{formatNumber(calculations.sum)}</span>
          </div>
          <div>
            Average: <span className="font-semibold">{formatNumber(calculations.average)}</span>
          </div>
          <div>
            Count: <span className="font-semibold">{calculations.count.toLocaleString()}</span>
          </div>
        </>
      )}
    </div>
  );
};