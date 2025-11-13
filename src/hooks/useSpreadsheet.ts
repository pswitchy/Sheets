// src/hooks/useSpreadsheet.ts

import { useState, useCallback } from 'react';
import { SpreadsheetData, Cell, CellFormat, SelectionState, Sheet } from '@/types/spreadsheet';
import { spreadsheetFunctions } from '@/lib/spreadsheet-functions';
import { columnToNumber, numberToColumn } from '@/lib/utils';

const DEFAULT_SHEET: Sheet = {
  id: 'sheet1',
  name: 'Sheet1',
  isActive: true,
  cells: {},
  rowCount: 100,
  columnCount: 26,
  frozen: { rows: 0, columns: 0 }
};

export function useSpreadsheet(initialData?: SpreadsheetData) {
  const [data, setData] = useState<SpreadsheetData>(initialData || {
    id: '',
    name: 'Untitled Spreadsheet',
    sheets: [DEFAULT_SHEET],
    activeSheetId: DEFAULT_SHEET.id,
    rowCount: 100,
    columnCount: 26,
    cells: {}, // This top-level cells object is kept for compatibility but logic now favors per-sheet cells
  });

  const [selection, setSelection] = useState<SelectionState>({
    start: 'A1',
    end: 'A1',
    sheetId: data.activeSheetId || 'sheet1'
  });

  const activeSheet = data.sheets.find(s => s.id === data.activeSheetId) || data.sheets[0];

  const updateActiveSheet = useCallback((updater: (sheet: Sheet) => Sheet) => {
    setData(prevData => {
      const updatedSheets = prevData.sheets.map(s =>
        s.id === prevData.activeSheetId ? updater(s) : s
      );
      return { ...prevData, sheets: updatedSheets };
    });
  }, []);

  const recalculateSheet = useCallback((sheet: Sheet): Sheet => {
    const cells = { ...sheet.cells };
    // A true implementation needs a topological sort for dependency graphs. This is a simplified sequential recalculation.
    const calculationOrder = Object.keys(cells);

    calculationOrder.forEach(cellId => {
        const cell = cells[cellId];
        if (cell?.formula) {
            const result = spreadsheetFunctions.evaluateFormula(cell.formula, cells);
            cells[cellId] = { ...cell, calculatedValue: result.toString() };
        }
    });

    return { ...sheet, cells };
  }, []);

  const updateCell = useCallback((cellRef: string, value: string) => {
    updateActiveSheet(sheet => {
      const newCells = { ...sheet.cells };
      const oldCell = newCells[cellRef];

      newCells[cellRef] = {
        ...(oldCell || { id: cellRef, format: {}, dependencies: [] }),
        value: value,
        formula: value.startsWith('=') ? value : '',
      } as Cell;
      
      const newSheet = { ...sheet, cells: newCells };
      // After one cell changes, the whole sheet needs recalculation for dependent cells
      return recalculateSheet(newSheet);
    });
  }, [updateActiveSheet, recalculateSheet]);

  const formatCells = useCallback((format: Partial<CellFormat>) => {
    updateActiveSheet(sheet => {
        const newCells = { ...sheet.cells };
        const startRef = parseCellRef(selection.start);
        const endRef = parseCellRef(selection.end);

        const minRow = Math.min(startRef.row, endRef.row);
        const maxRow = Math.max(startRef.row, endRef.row);
        const minCol = Math.min(startRef.col, endRef.col);
        const maxCol = Math.max(startRef.col, endRef.col);

        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                const cellRef = `${numberToColumn(c)}${r}`;
                const oldCell = newCells[cellRef] || { value: '', id: cellRef, formula: '', dependencies: [] };
                newCells[cellRef] = {
                    ...oldCell,
                    format: { ...(oldCell.format || {}), ...format }
                } as Cell;
            }
        }
        return { ...sheet, cells: newCells };
    });
  }, [selection, updateActiveSheet]);
  
  const addRow = useCallback(() => updateActiveSheet(s => ({ ...s, rowCount: s.rowCount + 1 })), [updateActiveSheet]);
  const deleteRow = useCallback(() => updateActiveSheet(s => ({ ...s, rowCount: Math.max(1, s.rowCount - 1) })), [updateActiveSheet]);
  const addColumn = useCallback(() => updateActiveSheet(s => ({ ...s, columnCount: s.columnCount + 1 })), [updateActiveSheet]);
  const deleteColumn = useCallback(() => updateActiveSheet(s => ({ ...s, columnCount: Math.max(1, s.columnCount - 1) })), [updateActiveSheet]);

  const setActiveSheetId = useCallback((sheetId: string) => {
    setData(prev => ({...prev, activeSheetId: sheetId, sheets: prev.sheets.map(s => ({...s, isActive: s.id === sheetId}))}));
    setSelection({start: 'A1', end: 'A1', sheetId});
  }, []);

  const parseCellRef = (ref: string): { row: number; col: number } => {
    const match = ref.match(/([A-Z]+)(\d+)/);
    if (!match) return { row: 1, col: 1 }; // Default to A1
    return {
      col: columnToNumber(match[1]),
      row: parseInt(match[2], 10),
    };
  };

  return {
    data,
    setData, // Exposed for initial data loading
    activeSheet,
    selection,
    setSelection,
    updateCell,
    formatCells,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    setActiveSheetId,
    recalculateSheet,
  };
}