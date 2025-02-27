// src/types/spreadsheet.ts
  import { ChartConfig } from './chart';


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
  
  export interface Chart {
    id: string;
    type: 'line' | 'bar' | 'pie' | 'scatter';
    title: string;
    dataRange: string;
    sheetId: string;
    options: {
      showLegend: boolean;
      showGrid: boolean;
      xAxis: string;
      yAxis: string;
      colors: string[];
    };
  }

  export interface Chart {
    id: string;
    type: 'line' | 'bar' | 'pie' | 'scatter';
    title: string;
    dataRange: string;
    sheetId: string;
    options: {
      showLegend: boolean;
      showGrid: boolean;
      xAxis: string;
      yAxis: string;
      colors: string[];
    };
  }

  export interface SpreadsheetData {
    id?: string;
    name?: string;
    charts?: ChartConfig[];
    cells: { [key: string]: Cell };
    rowCount: number;
    columnCount: number;
    activeSheet?: string;
    selectedRange?: {
      start: CellPosition;
      end: CellPosition;
    };
    frozen?: {
      rows: number;
      columns: number;
    };
    sheets: Sheet[]; 
    activeSheetId?: string;
  }

  export interface SpreadsheetMeta {
    id: string;
    name: string;
    owner: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
    version: number;
    isPublic: boolean;
  }

  export type CellPosition = {
    row: number;
    column: string; // Changed from number to string
    toString: () => string;
  };
  
  export interface Selection {
    start: CellPosition;
    end: CellPosition;
  }
  
  export interface CellFormat {
    bold: boolean;
    italic: boolean;
    fontSize: number;
    fontFamily?: string;
    underline: boolean;
    color: string;
    backgroundColor: string;
    textAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    textColor?: string;
    borderTop?: string;
    borderRight?: string;
    borderBottom?: string;
    borderLeft?: string;
  }
  
  export interface Cell {
    id: string;
    value: string;
    formula: string;
    format: CellFormat;
    dependencies: string[];
  }
  
  export interface GridProps {
    data: SpreadsheetData;
    onCellChange: (cellId: string, value: string) => void;
    onSelectionChange: (selection: Selection | null) => void;
    selection: Selection | null;
  }
  
  export interface ToolbarProps {
    onFormatChange: (format: Partial<CellFormat>) => void;
    onAddRow: () => void;
    onDeleteRow: () => void;
    onAddColumn: () => void;
    onDeleteColumn: () => void;
  }
  
  export type CellRange = {
    start: CellPosition;
    end: CellPosition;
  } | string;

  export type CellReference = string;

export interface SelectionState {
  start: CellReference;
  end: CellReference;
  sheetId: string;
}