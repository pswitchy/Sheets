// src/types/chart.ts

export type ChartType = 'line' | 'bar' | 'pie' | 'scatter';

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  dataRange: string;
  options: {
    axisTitle: { x?: string; y?: string };
    showLegend: boolean;
    showGrid: boolean;
    colors?: string[];
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[] | { x: number; y: number }[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}