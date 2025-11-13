// src/lib/chart-utils.ts

import { SpreadsheetData, Cell } from '@/types/spreadsheet';
import { ChartConfig, ChartData } from '@/types/chart';
import { columnToNumber, numberToColumn } from './utils';

export const generateChartData = (data: SpreadsheetData, config: ChartConfig): ChartData => {
  const activeSheet = data.sheets.find(s => s.id === data.activeSheetId);
  if (!activeSheet || !config.dataRange || !config.dataRange.includes(':')) {
    return { labels: [], datasets: [] };
  }

  const { cells } = activeSheet;
  const [startRef, endRef] = config.dataRange.split(':');
  
  const startMatch = startRef.match(/([A-Z]+)(\d+)/);
  const endMatch = endRef.match(/([A-Z]+)(\d+)/);

  if (!startMatch || !endMatch) return { labels: [], datasets: [] };

  const startCol = columnToNumber(startMatch[1]);
  const startRow = parseInt(startMatch[2], 10);
  const endCol = columnToNumber(endMatch[1]);
  const endRow = parseInt(endMatch[2], 10);
  
  const labels: string[] = [];
  const datasets: ChartData['datasets'] = [];

  // Assuming the first row of the selection is for labels (X-axis)
  // and the first column is for dataset headers (legend).
  for (let c = startCol + 1; c <= endCol; c++) {
    const headerRef = `${numberToColumn(c)}${startRow}`;
    const headerCell = cells[headerRef];
    
    const dataset: { label: string; data: number[]; backgroundColor: string; borderColor: string; } = {
      label: headerCell?.value || `Series ${c - startCol}`,
      data: [],
      backgroundColor: config.options.colors?.[datasets.length % config.options.colors.length] + '80', // Add alpha for fill
      borderColor: config.options.colors?.[datasets.length % config.options.colors.length] || '#000000',
    };

    for (let r = startRow + 1; r <= endRow; r++) {
      const cellRef = `${numberToColumn(c)}${r}`;
      const cell = cells[cellRef];
      const value = parseFloat(cell?.calculatedValue || cell?.value || '0');
      dataset.data.push(isNaN(value) ? 0 : value);
    }
    datasets.push(dataset);
  }

  // Populate labels from the first column of the selection
  for (let r = startRow + 1; r <= endRow; r++) {
      const labelRef = `${numberToColumn(startCol)}${r}`;
      const labelCell = cells[labelRef];
      labels.push(labelCell?.value || `Row ${r}`);
  }
  
  // Special case for Pie charts, which typically use one data series
  if (config.type === 'pie' && datasets.length > 0) {
    const pieDataset = datasets[0];
    pieDataset.backgroundColor = labels.map((_, i) => config.options.colors?.[i % config.options.colors.length] + 'B3'); // More alpha
    return { labels, datasets: [pieDataset] };
  }

  return { labels, datasets };
};