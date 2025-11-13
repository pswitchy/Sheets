// src/hooks/useSpreadsheet.ts

import { useState, useCallback } from 'react';
import { SpreadsheetData, Cell, CellFormat, SelectionState, Sheet } from '@/types/spreadsheet';
import { spreadsheetFunctions } from '@/lib/spreadsheet-functions';
import { columnToNumber, numberToColumn } from '@/lib/utils';

interface ClipboardData {
  cells: Record<string, Cell>; // Relative positions, e.g., "0,0"
  height: number;
  width: number;
}

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
    cells: {},
  });

  const [selection, setSelection] = useState<SelectionState>({
    start: 'A1',
    end: 'A1',
    sheetId: data.activeSheetId || 'sheet1'
  });

  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

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
  
  const parseCellRef = (ref: string): { row: number; col: number } => {
    const match = ref.match(/([A-Z]+)(\d+)/);
    if (!match) return { row: 1, col: 1 };
    return { col: columnToNumber(match[1]), row: parseInt(match[2], 10) };
  };

  const copyCells = useCallback(() => {
    if (!selection || !activeSheet) return;

    const start = parseCellRef(selection.start);
    const end = parseCellRef(selection.end);
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    
    const copiedCells: Record<string, Cell> = {};
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const sourceRef = `${numberToColumn(c)}${r}`;
        if (activeSheet.cells[sourceRef]) {
          const relativeRef = `${r - minRow},${c - minCol}`;
          copiedCells[relativeRef] = activeSheet.cells[sourceRef];
        }
      }
    }

    setClipboard({
      cells: copiedCells,
      height: maxRow - minRow + 1,
      width: maxCol - minCol + 1,
    });
  }, [selection, activeSheet]);

  const clearCells = useCallback(() => {
    updateActiveSheet(sheet => {
      const newCells = { ...sheet.cells };
      const start = parseCellRef(selection.start);
      const end = parseCellRef(selection.end);
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const cellRef = `${numberToColumn(c)}${r}`;
          if (newCells[cellRef]) {
            newCells[cellRef] = { ...newCells[cellRef], value: '', formula: '', calculatedValue: '' };
          }
        }
      }
      const newSheet = { ...sheet, cells: newCells };
      return recalculateSheet(newSheet);
    });
  }, [selection, updateActiveSheet, recalculateSheet]);

  const cutCells = useCallback(() => {
    copyCells();
    clearCells();
  }, [copyCells, clearCells]);

  const pasteCells = useCallback(() => {
    if (!clipboard || !selection || !activeSheet) return;

    updateActiveSheet(sheet => {
      const newCells = { ...sheet.cells };
      const pasteStart = parseCellRef(selection.start);

      for (const relativeRef in clipboard.cells) {
        const [relativeRow, relativeCol] = relativeRef.split(',').map(Number);
        const targetRow = pasteStart.row + relativeRow;
        const targetCol = pasteStart.col + relativeCol;

        if (targetRow <= sheet.rowCount && targetCol <= sheet.columnCount) {
          const targetRef = `${numberToColumn(targetCol)}${targetRow}`;
          newCells[targetRef] = {
            ...clipboard.cells[relativeRef],
            id: targetRef,
          };
        }
      }
      const newSheet = { ...sheet, cells: newCells };
      return recalculateSheet(newSheet);
    });
  }, [clipboard, selection, activeSheet, updateActiveSheet, recalculateSheet]);

  const updateCell = useCallback((cellRef: string, value: string) => {
    updateActiveSheet(sheet => {
      const newCells = { ...sheet.cells };
      newCells[cellRef] = {
        ...(newCells[cellRef] || { id: cellRef, format: {}, dependencies: [] }),
        value: value,
        formula: value.startsWith('=') ? value : '',
      } as Cell;
      
      return recalculateSheet({ ...sheet, cells: newCells });
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
                newCells[cellRef] = { ...oldCell, format: { ...(oldCell.format || {}), ...format } } as Cell;
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

  const addSheet = useCallback(() => {
    setData(prev => {
      const newSheetId = `sheet${Date.now()}`;
      const newSheetNumber = prev.sheets.length + 1;
      const newSheet: Sheet = {
        id: newSheetId,
        name: `Sheet${newSheetNumber}`,
        isActive: true,
        cells: {},
        rowCount: 100,
        columnCount: 26,
        frozen: { rows: 0, columns: 0 }
      };
      const updatedSheets = prev.sheets.map(s => ({...s, isActive: false}));
      return {
        ...prev,
        sheets: [...updatedSheets, newSheet],
        activeSheetId: newSheetId,
      }
    });
  }, []);

  const deleteSheet = useCallback((sheetId: string) => {
    setData(prev => {
      if (prev.sheets.length <= 1) return prev; // Don't delete the last sheet
      const newSheets = prev.sheets.filter(s => s.id !== sheetId);
      let newActiveId = prev.activeSheetId;
      if (newActiveId === sheetId) {
        newActiveId = newSheets[0]?.id; // Default to the first sheet
      }
      newSheets.forEach(s => s.isActive = s.id === newActiveId);
      return { ...prev, sheets: newSheets, activeSheetId: newActiveId };
    });
  }, []);

  const renameSheet = useCallback((sheetId: string, newName: string) => {
    setData(prev => ({
      ...prev,
      sheets: prev.sheets.map(s => s.id === sheetId ? { ...s, name: newName } : s)
    }));
  }, []);

  return {
    data,
    setData,
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
    cutCells,
    copyCells,
    pasteCells,
    clearCells,
    addSheet,
    deleteSheet,
    renameSheet,
  };
}