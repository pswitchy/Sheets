// src/types/spreadsheet.ts

import { ChartConfig } from './chart';

// Defines the structure of a single sheet within the spreadsheet
export interface Sheet {
  id: string;
  name: string;
  isActive: boolean;
  cells: { [key: string]: Cell };
  rowCount: number;
  columnCount: number;
  frozen: {
    rows: number;
    columns: number;
  };
}

// Defines the overall structure of the entire spreadsheet document
export interface SpreadsheetData {
  id: string;
  name: string;
  sheets: Sheet[];
  activeSheetId: string;
  charts?: ChartConfig[];
  // Deprecated top-level properties, kept for initial compatibility
  cells: { [key: string]: Cell };
  rowCount: number;
  columnCount: number;
}

// Defines the formatting properties for a cell
export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string; // Often used as a shorthand for textColor
}

// Defines the structure of a single cell
export interface Cell {
  id: string;
  value: string;
  formula: string;
  format: CellFormat;
  dependencies: string[];
  calculatedValue?: string; // The result of a formula evaluation
}

// Defines the state of the user's selection
export interface SelectionState {
  start: string; // e.g., "A1"
  end: string;   // e.g., "C5"
  sheetId: string;
}

export type CellPosition = {
  column: string;
  row: number;
};