// src/components/Spreadsheet/ChartPreview.tsx

import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { ChartConfig, ChartData } from '@/types/chart';

// Register all necessary components for Chart.js
ChartJS.register(...registerables);

interface ChartPreviewProps {
  config: ChartConfig;
  data: ChartData;
}

export const ChartPreview: React.FC<ChartPreviewProps> = ({ config, data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy the previous chart instance before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create the new chart instance
    chartInstance.current = new ChartJS(ctx, {
      type: config.type,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!config.title,
            text: config.title,
            font: { size: 16 },
          },
          legend: {
            display: config.options.showLegend,
            position: 'top',
          },
        },
        scales: config.type !== 'pie' ? {
          x: {
            display: true,
            grid: { display: config.options.showGrid },
            title: {
              display: !!config.options.axisTitle?.x,
              text: config.options.axisTitle?.x,
            },
          },
          y: {
            display: true,
            grid: { display: config.options.showGrid },
            title: {
              display: !!config.options.axisTitle?.y,
              text: config.options.axisTitle?.y,
            },
            beginAtZero: true,
          },
        } : undefined,
      },
    });

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [config, data]); // Re-run effect if config or data changes

  if (!data || !data.datasets || data.datasets.every(ds => ds.data.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-center text-gray-500">
        <div>
          <p className="font-semibold">No Data to Display</p>
          <p className="text-sm mt-1">
            Please provide a valid data range (e.g., A1:B5) in the setup tab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <canvas ref={chartRef} />
    </div>
  );
};

export default ChartPreview;