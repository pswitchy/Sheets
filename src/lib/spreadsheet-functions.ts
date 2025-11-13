// src/lib/spreadsheet-functions.ts

import { Cell } from '@/types/spreadsheet';
import { columnToNumber, numberToColumn } from './utils';

// Helper to parse a cell reference like "A1" into { col: 1, row: 1 }
const parseCellRef = (ref: string): { col: number; row: number } | null => {
  const match = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  return {
    col: columnToNumber(match[1]),
    row: parseInt(match[2], 10),
  };
};

// Gets all numeric values from a range string like "A1:C5"
function getValuesFromRange(range: string, cells: { [key: string]: Cell }): number[] {
  const [startRef, endRef] = range.split(':');
  const start = parseCellRef(startRef);
  const end = parseCellRef(endRef);

  if (!start || !end) return [];

  const values: number[] = [];
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const cellRef = `${numberToColumn(c)}${r}`;
      const cell = cells[cellRef];
      const value = parseFloat(cell?.calculatedValue || cell?.value || '0');
      if (!isNaN(value)) {
        values.push(value);
      }
    }
  }
  return values;
}

function evaluateSUM(range: string, cells: { [key: string]: Cell }): number {
  const values = getValuesFromRange(range, cells);
  return values.reduce((sum, val) => sum + val, 0);
}

function evaluateAVERAGE(range: string, cells: { [key: string]: Cell }): number {
  const values = getValuesFromRange(range, cells);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

function evaluateCOUNT(range: string, cells: { [key:string]: Cell }): number {
    const values = getValuesFromRange(range, cells);
    return values.length;
}

export const spreadsheetFunctions = {
  evaluateFormula: (formula: string, cells: { [key: string]: Cell }): string | number => {
    if (!formula.startsWith('=')) return formula;

    let expression = formula.substring(1).toUpperCase();

    // Handle functions like SUM(A1:B10)
    expression = expression.replace(/SUM\(([^)]+)\)/g, (_, range) => {
        return evaluateSUM(range, cells).toString();
    });
    expression = expression.replace(/AVERAGE\(([^)]+)\)/g, (_, range) => {
        return evaluateAVERAGE(range, cells).toString();
    });
    expression = expression.replace(/COUNT\(([^)]+)\)/g, (_, range) => {
        return evaluateCOUNT(range, cells).toString();
    });

    // Replace remaining cell references with their values
    expression = expression.replace(/[A-Z]+\d+/g, (match) => {
      const cell = cells[match];
      const value = cell?.calculatedValue || cell?.value;
      // If the value is not a valid number, it can't be used in math operations, return 0.
      return (value && !isNaN(parseFloat(value))) ? value : '0';
    });
    
    try {
      // Use a safe evaluation method. `eval` is dangerous. This is safer but still limited.
      // For a production app, a proper math expression parser (like math.js) is recommended.
      return new Function(`"use strict"; return (${expression})`)();
    } catch (error) {
      console.error(`Formula evaluation error for: "${formula}"`, error);
      return '#ERROR!';
    }
  },
};