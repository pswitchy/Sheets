// src/lib/spreadsheet-functions.ts
import { Cell } from '@/types/spreadsheet';

export const spreadsheetFunctions = {
  evaluateFormula: (formula: string, cells: { [key: string]: Cell }): string | number => {
    if (!formula.startsWith('=')) return formula;
    
    const expression = formula.substring(1);
    
    // Replace cell references with their values (case-insensitive)
    const evaluatedExpression = expression.replace(/[A-Z]+\d+/gi, (match) => {
      const cellId = match.toUpperCase();
      const cell = cells[cellId];
      return cell ? (cell.calculatedValue || cell.value || '0').toString() : '0';
    });

    try {
      // Basic math operations
      if (evaluatedExpression.includes('SUM')) {
        return evaluateSUM(evaluatedExpression, cells);
      } else if (evaluatedExpression.includes('AVERAGE')) {
        return evaluateAVERAGE(evaluatedExpression, cells);
      } else if (evaluatedExpression.includes('COUNT')) {
        return evaluateCOUNT(evaluatedExpression, cells);
      }
      
      // Safely evaluate the expression
      return Function(`"use strict"; return (${evaluatedExpression})`)();
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return '#ERROR!';
    }
  },
};

function evaluateSUM(expression: string, cells: { [key: string]: Cell }): number {
  const range = expression.match(/SUM\s*\(\s*(.*?)\s*\)/i)?.[1];
  if (!range) return 0;
  
  try {
    const values = getCellValuesFromRange(range, cells);
    return values.reduce((sum, val) => sum + (Number(val) || 0), 0);
  } catch (error) {
    console.error('Error in SUM function:', error);
    return 0;
  }
}

function evaluateAVERAGE(expression: string, cells: { [key: string]: Cell }): number {
  const range = expression.match(/AVERAGE\s*\(\s*(.*?)\s*\)/i)?.[1];
  if (!range) return 0;
  
  try {
    const values = getCellValuesFromRange(range, cells);
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + (Number(val) || 0), 0);
    return values.length ? sum / values.length : 0;
  } catch (error) {
    console.error('Error in AVERAGE function:', error);
    return 0;
  }
}

function evaluateCOUNT(expression: string, cells: { [key: string]: Cell }): number {
  const range = expression.match(/COUNT\s*\(\s*(.*?)\s*\)/i)?.[1];
  if (!range) return 0;
  
  try {
    const values = getCellValuesFromRange(range, cells);
    return values.filter(val => val !== '').length;
  } catch (error) {
    console.error('Error in COUNT function:', error);
    return 0;
  }
}

function getCellValuesFromRange(range: string, cells: { [key: string]: Cell }): string[] {
  try {
    const trimmedRange = range.trim();
    if (!trimmedRange) return [];

    // Handle single cell reference
    if (!trimmedRange.includes(':')) {
      const cell = cells[trimmedRange.toUpperCase()];
      return cell ? [cell.value || ''] : [''];
    }

    const [start, end] = trimmedRange.split(':').map(ref => ref.trim().toUpperCase());
    const startCell = parseCell(start);
    const endCell = parseCell(end);

    if (!startCell || !endCell) {
      console.warn(`Invalid range: ${range}, using empty array`);
      return [];
    }

    const values: string[] = [];
    const minCol = Math.min(startCell.col, endCell.col);
    const maxCol = Math.max(startCell.col, endCell.col);
    const minRow = Math.min(startCell.row, endCell.row);
    const maxRow = Math.max(startCell.row, endCell.row);

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cellId = `${getColumnLabel(col)}${row + 1}`;
        const cell = cells[cellId];
        values.push(cell?.value || '');
      }
    }

    return values;
  } catch (error) {
    console.error('Error in getCellValuesFromRange:', error);
    return [];
  }
}

// Helper to convert column number to column letter (A, B, C, ...)
function getColumnLabel(colIndex: number): string {
  let label = '';
  while (colIndex >= 0) {
    label = String.fromCharCode(65 + (colIndex % 26)) + label;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return label;
}

function parseCell(cellId: string): { col: number; row: number } | null {
  try {
    if (!cellId || typeof cellId !== 'string') {
      console.warn(`Invalid cell ID: ${cellId}`);
      return null;
    }

    const match = cellId.trim().match(/^([A-Za-z]+)\s*(\d+)$/i);
    if (!match) {
      console.warn(`Invalid cell reference format: ${cellId}`);
      return null;
    }

    const [, colStr, rowStr] = match;
    const colStrUpper = colStr.toUpperCase();

    // Convert column letters to a zero-based index
    const col = colStrUpper.split('').reduce((acc, char) => {
      return acc * 26 + char.charCodeAt(0) - 65;
    }, 0);

    const row = parseInt(rowStr, 10) - 1; // Convert to 0-based index
    if (isNaN(row) || row < 0) {
      console.warn(`Invalid row number: ${rowStr}`);
      return null;
    }

    return { col, row };
  } catch (error) {
    console.error('Cell parsing error:', error);
    return null;
  }
}