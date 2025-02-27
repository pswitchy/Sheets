// src/hooks/useSpreadsheet.ts

import { useState, useCallback } from 'react';
import { SpreadsheetData, Cell, CellPosition } from '@/types/spreadsheet';
import { spreadsheetFunctions } from '@/lib/spreadsheet-functions';
import { cellUtils } from '@/lib/cell-utils';

export function useSpreadsheet(initialData?: SpreadsheetData) {
  const [data, setData] = useState<SpreadsheetData>(initialData || {
    cells: {},
    rowCount: 100,
    columnCount: 26,
    sheets: [],
  });

  const [selectedRange, setSelectedRange] = useState<{
    start: CellPosition;
    end: CellPosition;
  } | null>(null);

  const updateCell = useCallback((cellId: string, value: string) => {
    setData((prevData) => {
      const newCells = { ...prevData.cells };
      
      if (!newCells[cellId]) {
        newCells[cellId] = {
          id: cellId,
          value: '',
          formula: '',
          format: {
            bold: false,
            italic: false,
            underline: false,
            fontSize: 14,
            color: '#000000',
            backgroundColor: '#ffffff',
          },
          dependencies: [],
        };
      }
  
      if (value.startsWith('=')) {
        newCells[cellId].formula = value;
        const result = spreadsheetFunctions.evaluateFormula(value, newCells);
        newCells[cellId].value = result.toString(); // Convert to string
      } else {
        newCells[cellId].value = value;
        newCells[cellId].formula = '';
      }
  
      return {
        ...prevData,
        cells: newCells,
      };
    });
  }, []);

  const formatCell = useCallback((cellId: string, format: Partial<Cell['format']>) => {
    setData((prevData) => {
      const newCells = { ...prevData.cells };
      if (!newCells[cellId]) return prevData;

      newCells[cellId].format = {
        ...newCells[cellId].format,
        ...format,
      };

      return {
        ...prevData,
        cells: newCells,
      };
    });
  }, []);

  const findDependentCells = (cellId: string, cells: { [key: string]: Cell }): string[] => {
    return Object.entries(cells)
      .filter(([_, cell]) => cell.dependencies.includes(cellId))
      .map(([id]) => id);
  };

  const addRow = useCallback(() => {
    setData((prevData) => ({
      ...prevData,
      rowCount: prevData.rowCount + 1,
    }));
  }, []);

  const deleteRow = useCallback((rowIndex: number) => {
    setData((prevData) => {
      const newCells = { ...prevData.cells };
      
      // Remove cells in the specified row
      Object.keys(newCells).forEach((cellId) => {
        const row = parseInt(cellId.match(/\d+/)?.[0] || '0', 10);
        if (row === rowIndex) {
          delete newCells[cellId];
        } else if (row > rowIndex) {
          // Shift cells up
          const col = cellId.match(/[A-Z]+/)?.[0] || 'A';
          const newCellId = `${col}${row - 1}`;
          newCells[newCellId] = newCells[cellId];
          delete newCells[cellId];
        }
      });

      return {
        ...prevData,
        cells: newCells,
        rowCount: prevData.rowCount - 1,
      };
    });
  }, []);

  const addColumn = useCallback(() => {
    setData((prevData) => ({
      ...prevData,
      columnCount: prevData.columnCount + 1,
    }));
  }, []);

  const deleteColumn = useCallback(() => {
    setData((prevData) => {
      const newCells = { ...prevData.cells };
      
      // Remove cells in the specified column
      Object.keys(newCells).forEach((cellId) => {
        const { column } = cellUtils.parsePosition(cellId);
        const columnIndex = cellUtils.columnToIndex(column);
        
        if (columnIndex === prevData.columnCount - 1) {
          delete newCells[cellId];
        } else if (columnIndex < prevData.columnCount - 1) {
          // Shift cells left
          const newColumn = cellUtils.indexToColumn(columnIndex);
          const row = cellUtils.parsePosition(cellId).row;
          const newCellId = `${newColumn}${row}`;
          newCells[newCellId] = newCells[cellId];
          delete newCells[cellId];
        }
      });

      return {
        ...prevData,
        cells: newCells,
        columnCount: Math.max(1, prevData.columnCount - 1), // Ensure at least one column remains
      };
    });
  }, []);

  const clearCell = useCallback((cellId: string) => {
    setData((prevData) => {
      const newCells = { ...prevData.cells };
      if (newCells[cellId]) {
        newCells[cellId] = {
          ...newCells[cellId],
          value: '',
          formula: '',
        };
      }
      return {
        ...prevData,
        cells: newCells,
      };
    });
  }, []);

  return {
    data,
    selectedRange,
    setSelectedRange,
    updateCell,
    formatCell,
    addRow,
    deleteRow,
    addColumn,     
    deleteColumn,
    clearCell,
    setData,
  };
}