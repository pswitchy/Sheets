// src/lib/chart-utils.ts


import { SpreadsheetData } from '@/types/spreadsheet';
import { ChartConfig, ChartData } from '@/types/chart';

export const generateChartData = (data: SpreadsheetData, config: ChartConfig): ChartData => {
    // Return empty chart data if no range is specified
    if (!config.dataRange) {
        return {
            labels: [],
            datasets: []
        };
    }

    // 1. Parse the dataRange (e.g., "A1:B5")
    const rangeParts = config.dataRange.split(':');
    if (rangeParts.length !== 2) {
        return {
            labels: [],
            datasets: []
        };
    }

    const [startCell, endCell] = rangeParts;
    
    // Safe parsing of column and row values
    const startColMatch = startCell?.match(/[A-Z]+/);
    const startRowMatch = startCell?.match(/\d+/);
    const endColMatch = endCell?.match(/[A-Z]+/);
    const endRowMatch = endCell?.match(/\d+/);

    if (!startColMatch || !startRowMatch || !endColMatch || !endRowMatch) {
        return {
            labels: [],
            datasets: []
        };
    }

    const startCol = startColMatch[0];
    const startRow = parseInt(startRowMatch[0], 10);
    const endCol = endColMatch[0];
    const endRow = parseInt(endRowMatch[0], 10);

    // 2. Extract data from the spreadsheet
    const labels: string[] = [];
    const datasets: { 
        label: string; 
        data: number[] | { x: number; y: number }[]; 
        backgroundColor?: string | string[]; 
        borderColor?: string;
    }[] = [];

    // Determine the number of datasets based on whether the range includes multiple columns or rows
    const isMultiColumn = startCol !== endCol;
    const isMultiRow = startRow !== endRow;

    if (isMultiColumn) {
        // Multiple columns: Each column is a dataset
        for (let colCode = startCol.charCodeAt(0); colCode <= endCol.charCodeAt(0); colCode++) {
            const col = String.fromCharCode(colCode);
            const dataset = {
                label: col,
                data: [] as number[],
                backgroundColor: config.options.colors?.[datasets.length % (config.options.colors.length || 1)],
                borderColor: config.options.colors?.[datasets.length % (config.options.colors.length || 1)]
            };

            for (let row = startRow; row <= endRow; row++) {
                const cellId = `${col}${row}`;
                const cellValue = parseFloat(data.cells[cellId]?.value || '0');
                dataset.data.push(isNaN(cellValue) ? 0 : cellValue);
                
                if (colCode === startCol.charCodeAt(0)) {
                    labels.push(data.cells[`${startCol}${row}`]?.value || `${row}`);
                }
            }
            datasets.push(dataset);
        }
    } else if (isMultiRow) {
        // Single column, multiple rows
        const dataset = {
            label: data.cells[`${startCol}${startRow - 1}`]?.value || startCol,
            data: [] as number[],
            backgroundColor: config.options.colors?.[0],
            borderColor: config.options.colors?.[0]
        };

        for (let row = startRow; row <= endRow; row++) {
            const cellId = `${startCol}${row}`;
            const cellValue = parseFloat(data.cells[cellId]?.value || '0');
            dataset.data.push(isNaN(cellValue) ? 0 : cellValue);
            labels.push(data.cells[`${String.fromCharCode(startCol.charCodeAt(0) - 1)}${row}`]?.value || `${row}`);
        }
        datasets.push(dataset);
    } else {
        // Single cell
        const cellValue = parseFloat(data.cells[startCell]?.value || '0');
        labels.push(startCell);
        datasets.push({
            label: startCell,
            data: [isNaN(cellValue) ? 0 : cellValue],
            backgroundColor: config.options.colors?.[0],
            borderColor: config.options.colors?.[0]
        });
    }

    // 3. Apply chart-specific formatting
    switch (config.type) {
        case 'line':
            datasets.forEach(dataset => {
                dataset.borderColor = dataset.borderColor || 'rgba(75, 192, 192, 1)';
                dataset.backgroundColor = 'rgba(75, 192, 192, 0.2)';
            });
            break;

        case 'bar':
            datasets.forEach(dataset => {
                dataset.backgroundColor = dataset.backgroundColor || 'rgba(54, 162, 235, 0.6)';
            });
            break;

        case 'pie':
            if (datasets.length > 0) {
                const pieColors = config.options.colors || [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ];
                
                datasets[0].backgroundColor = pieColors;
            }
            break;

        case 'scatter':
            datasets.forEach(dataset => {
                const numericData = dataset.data as number[];
                dataset.data = numericData.map((value, index) => ({
                    x: index,
                    y: value
                }));
                dataset.backgroundColor = dataset.backgroundColor || 'rgba(255, 99, 132, 1)';
            });
            break;
    }

    return { labels, datasets };
};