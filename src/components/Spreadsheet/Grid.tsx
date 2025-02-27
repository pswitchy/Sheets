// src/components/Spreadsheet/Grid.tsx

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Cell } from './Cell';
import { Sheet, CellFormat, SelectionState } from '@/types/spreadsheet';
import { columnToNumber, numberToColumn } from '@/lib/utils';

interface GridProps {
    sheet: Sheet;
    selection: SelectionState;
    onSelectionChange: (selection: SelectionState) => void;
    onCellChange: (cellRef: string, value: string) => void;
    onCellFormatChange: (cellRef: string, format: Partial<CellFormat>) => void;
    currentFormat: CellFormat;
}

export const Grid: React.FC<GridProps> = ({
  sheet,
  selection,
  onSelectionChange,
  onCellChange,
  currentFormat,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });

  const handleScroll = useCallback(() => {
    if (gridRef.current) {
      setScrollPosition({
        top: gridRef.current.scrollTop,
        left: gridRef.current.scrollLeft,
      });
    }
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (grid) {
      grid.addEventListener('scroll', handleScroll);
      return () => grid.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const getCellRef = useCallback((row: number, col: number): string => {
    return `${numberToColumn(col)}${row}`;
  }, []);

  const renderHeaderRow = () => {
    const headers = [];
    // Corner cell
    headers.push(
      <div
        key="corner"
        className="sticky top-0 left-0 bg-gray-200 border-r border-b border-gray-300 z-20"
        style={{ gridColumn: 1, gridRow: 1 }}
      />
    );

    // Column headers
    for (let col = 1; col <= sheet.columnCount; col++) {
      headers.push(
        <div
          key={`header-${col}`}
          className="sticky top-0 bg-gray-100 border-r border-b border-gray-300 px-2 py-1 text-center font-medium z-10"
          style={{ gridColumn: col + 1 }}
        >
          {numberToColumn(col)}
        </div>
      );
    }
    return headers;
  };

  const renderRowHeaders = () => {
    const headers = [];
    for (let row = 1; row <= sheet.rowCount; row++) {
      headers.push(
        <div
          key={`row-${row}`}
          className="sticky left-0 bg-gray-100 border-r border-b border-gray-300 px-2 py-1 text-center font-medium z-10"
          style={{ gridRow: row + 1 }}
        >
          {row}
        </div>
      );
    }
    return headers;
  };

  const isInSelection = useCallback((cellRef: string) => {
    if (!selection.start || !selection.end) return false;

    const startCol = columnToNumber(selection.start.match(/[A-Z]+/)![0]);
    const startRow = parseInt(selection.start.match(/\d+/)![0]);
    const endCol = columnToNumber(selection.end.match(/[A-Z]+/)![0]);
    const endRow = parseInt(selection.end.match(/\d+/)![0]);

    const col = columnToNumber(cellRef.match(/[A-Z]+/)![0]);
    const row = parseInt(cellRef.match(/\d+/)![0]);

    return (
      col >= Math.min(startCol, endCol) &&
      col <= Math.max(startCol, endCol) &&
      row >= Math.min(startRow, endRow) &&
      row <= Math.max(startRow, endRow)
    );
  }, [selection]);

  const handleMouseDown = useCallback((cellRef: string) => {
    setIsSelecting(true);
    onSelectionChange({
      start: cellRef,
      end: cellRef,
      sheetId: sheet.id
    });
  }, [sheet.id, onSelectionChange]);

  const handleMouseEnter = useCallback((cellRef: string) => {
    if (isSelecting) {
      onSelectionChange({
        ...selection,
        end: cellRef
      });
    }
  }, [isSelecting, selection, onSelectionChange]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  const renderCells = useCallback(() => {
    const cells = [];
    for (let row = 1; row <= sheet.rowCount; row++) {
      for (let col = 1; col <= sheet.columnCount; col++) {
        const cellRef = getCellRef(row, col);
        const cell = sheet.cells[cellRef] || { value: '', format: {} };
        cells.push(
          <Cell
            key={cellRef}
            cellRef={cellRef}
            value={cell.value}
            format={{ ...currentFormat, ...cell.format }}
            isSelected={selection.start === cellRef}
            isInSelection={isInSelection(cellRef)}
            onChange={(value) => onCellChange(cellRef, value)}
            onMouseDown={() => handleMouseDown(cellRef)}
            onMouseEnter={() => handleMouseEnter(cellRef)}
            isHeader={false}
            formula={cell.formula}
          />
        );
      }
    }
    return cells;
  }, [
    sheet,
    currentFormat,
    selection,
    getCellRef,
    isInSelection,
    onCellChange,
    handleMouseDown,
    handleMouseEnter
  ]);

  return (
    <div 
      ref={gridRef}
      className="w-full h-full overflow-auto"
      style={{ 
        position: 'relative',
        WebkitOverflowScrolling: 'touch' 
      }}
    >
      <div
        className="absolute min-w-full"
        style={{
          display: 'grid',
          gridTemplateColumns: `30px repeat(${sheet.columnCount}, minmax(100px, 1fr))`,
          gridTemplateRows: `30px repeat(${sheet.rowCount}, 40px)`,
          backgroundColor: '#f8f9fa',
        }}
      >
        {renderHeaderRow()}
        {renderRowHeaders()}
        {renderCells()}
      </div>
    </div>
  );
};

export default Grid;