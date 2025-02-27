// src/components/Spreadsheet/ChartPreview.tsx


import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { ChartConfig, ChartData } from '@/types/chart';
import { generateChartData } from '@/lib/chart-utils';

interface ChartPreviewProps {
  config: ChartConfig;
  data: ChartData;
}

export const ChartPreview: React.FC<ChartPreviewProps> = ({ config, data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart if exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new ChartJS(ctx, {
      type: config.type,
      data: {
        labels: data.labels,
        datasets: data.datasets.map((dataset, index) => ({
          label: dataset.label,
          data: dataset.data,
          backgroundColor: config.options.colors?.[index % (config.options.colors.length || 1)],
          borderColor: config.options.colors?.[index % (config.options.colors.length || 1)],
          tension: 0.4,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: config.title,
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          legend: {
            display: config.options.showLegend,
            position: 'bottom',
          },
        },
        scales: config.type !== 'pie' ? {
          x: {
            display: true,
            grid: {
              display: config.options.showGrid,
            },
            title: {
              display: !!config.options.axisTitle?.x,
              text: config.options.axisTitle?.x,
            },
          },
          y: {
            display: true,
            grid: {
              display: config.options.showGrid,
            },
            title: {
              display: !!config.options.axisTitle?.y,
              text: config.options.axisTitle?.y,
            },
            beginAtZero: true,
          },
        } : undefined,
        animation: {
          duration: 500,
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [config, data]);

  const renderNoDataMessage = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-gray-500 mb-2">No data available</p>
        <p className="text-sm text-gray-400">
          Select a valid data range to preview the chart
        </p>
      </div>
    </div>
  );

  if (!data.datasets.length || !data.labels.length) {
    return renderNoDataMessage();
  }

  return (
    <div className="relative h-full w-full">
      <canvas ref={chartRef} />
    </div>
  );
};

export default ChartPreview;