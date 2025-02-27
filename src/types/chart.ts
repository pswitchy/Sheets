// src/types/chart.ts
export type ChartType = 'line' | 'bar' | 'pie' | 'scatter';

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  dataRange: string;
  options: {
    axisTitle: any;
    showLegend: boolean;
    showGrid: boolean;
    xAxis?: string;
    yAxis?: string;
    colors?: string[];
  };
}

export interface ChartData {
    labels: string[];
    datasets: {
      label: string;
      data: number[] | { x: number; y: number; }[];
    }[];
}