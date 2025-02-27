// src/lib/spreadsheet-functions.ts

import { Cell } from '@/types/spreadsheet';

export const spreadsheetFunctions = {
  evaluateFormula: (formula: string, cells: { [key: string]: Cell }): string | number => {
    if (!formula.startsWith('=')) return formula;
    
    const expression = formula.substring(1);
    
    // Replace cell references with their values
    const evaluatedExpression = expression.replace(/[A-Z]+\d+/g, (match) => {
      const cell = cells[match];
      return cell ? cell.value.toString() : '0';
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
  const range = expression.match(/SUM\((.*)\)/)?.[1];
  if (!range) return 0;
  
  const values = getCellValuesFromRange(range, cells);
  return values.reduce((sum, val) => sum + (Number(val) || 0), 0);
}

function evaluateAVERAGE(expression: string, cells: { [key: string]: Cell }): number {
  const range = expression.match(/AVERAGE\((.*)\)/)?.[1];
  if (!range) return 0;
  
  const values = getCellValuesFromRange(range, cells);
  const sum = values.reduce((acc, val) => acc + (Number(val) || 0), 0);
  return values.length ? sum / values.length : 0;
}

function evaluateCOUNT(expression: string, cells: { [key: string]: Cell }): number {
  const range = expression.match(/COUNT\((.*)\)/)?.[1];
  if (!range) return 0;
  
  const values = getCellValuesFromRange(range, cells);
  return values.filter(val => val !== '').length;
}

function getCellValuesFromRange(range: string, cells: { [key: string]: Cell }): string[] {
  const [start, end] = range.split(':');
  const values: string[] = [];
  
  if (!end) {
    // Single cell or comma-separated cells
    return range.split(',').map(cellId => cells[cellId.trim()]?.value || '');
  }
  
  // Range of cells
  const startCell = parseCell(start);
  const endCell = parseCell(end);
  
  for (let col = startCell.col; col <= endCell.col; col++) {
    for (let row = startCell.row; row <= endCell.row; row++) {
      const cellId = `${String.fromCharCode(65 + col)}${row}`;
      values.push(cells[cellId]?.value || '');
    }
  }
  
  return values;
}

function parseCell(cellId: string): { col: number; row: number } {
  const match = cellId.match(/([A-Z]+)(\d+)/);
  if (!match) throw new Error('Invalid cell reference');
  
  const col = match[1].split('').reduce((acc, char) => 
    acc * 26 + char.charCodeAt(0) - 65, 0);
  const row = parseInt(match[2], 10);
  
  return { col, row };
}