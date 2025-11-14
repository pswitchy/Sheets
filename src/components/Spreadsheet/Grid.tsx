// src/components/Spreadsheet/Grid.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { Cell as CellComponent } from './Cell';
import { Sheet, CellFormat, SelectionState } from '@/types/spreadsheet';
import { columnToNumber, numberToColumn } from '@/lib/utils';
import { cn } from '@/lib/utils';

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
}) => {
  const [isSelecting, setIsSelecting] = useState(false);

  const getCellRef = useCallback((row: number, col: number): string => {
    return `${numberToColumn(col)}${row}`;
  }, []);

  const handleMouseDown = useCallback((cellRef: string) => {
    setIsSelecting(true);
    onSelectionChange({ start: cellRef, end: cellRef, sheetId: sheet.id });
  }, [sheet.id, onSelectionChange]);

  const handleMouseEnter = useCallback((cellRef: string) => {
    if (isSelecting) {
      onSelectionChange({ ...selection, end: cellRef });
    }
  }, [isSelecting, selection, onSelectionChange]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);
  
  // ✅ NEW: Handlers for row and column header clicks
  const handleRowHeaderClick = (rowIndex: number) => {
    const lastColumn = numberToColumn(sheet.columnCount);
    onSelectionChange({
      start: `A${rowIndex}`,
      end: `${lastColumn}${rowIndex}`,
      sheetId: sheet.id,
    });
  };

  const handleColumnHeaderClick = (colIndex: number) => {
    const columnLetter = numberToColumn(colIndex);
    onSelectionChange({
      start: `${columnLetter}1`,
      end: `${columnLetter}${sheet.rowCount}`,
      sheetId: sheet.id,
    });
  };

  const renderGrid = () => {
    const gridItems = [];
    const lastColumnLetter = numberToColumn(sheet.columnCount);

    gridItems.push(<div key="corner" className="sticky top-0 left-0 bg-gray-200 border-r border-b border-gray-300 z-30" />);

    for (let c = 1; c <= sheet.columnCount; c++) {
      gridItems.push(
        <div 
          key={`col-header-${c}`} 
          className="sticky top-0 bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center font-semibold text-sm z-20 cursor-pointer hover:bg-gray-200"
          onClick={() => handleColumnHeaderClick(c)} // ✅ NEW
        >
          {numberToColumn(c)}
        </div>
      );
    }

    for (let r = 1; r <= sheet.rowCount; r++) {
      gridItems.push(
        <div 
          key={`row-header-${r}`} 
          className="sticky left-0 bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center font-semibold text-sm z-20 cursor-pointer hover:bg-gray-200"
          onClick={() => handleRowHeaderClick(r)} // ✅ NEW
        >
          {r}
        </div>
      );
      for (let c = 1; c <= sheet.columnCount; c++) {
        const cellRef = getCellRef(r, c);
        const cellData = sheet.cells[cellRef];
        const { row: startRow, col: startCol } = parseCellRef(selection.start);
        const { row: endRow, col: endCol } = parseCellRef(selection.end);

        const isSelected = r === startRow && c === startCol;
        const isInSelection =
          r >= Math.min(startRow, endRow) && r <= Math.max(startRow, endRow) &&
          c >= Math.min(startCol, endCol) && c <= Math.max(startCol, endCol);

        gridItems.push(
          <CellComponent
            key={cellRef}
            cellRef={cellRef}
            value={cellData?.calculatedValue || cellData?.value || ''}
            formula={cellData?.formula}
            format={cellData?.format || {}}
            isSelected={isSelected}
            isInSelection={isInSelection}
            onChange={(value) => onCellChange(cellRef, value)}
            onMouseDown={() => handleMouseDown(cellRef)}
            onMouseEnter={() => handleMouseEnter(cellRef)}
            isHeader={false}
          />
        );
      }
    }
    return gridItems;
  };

  const parseCellRef = (ref: string): { row: number; col: number } => {
    const match = ref.match(/([A-Z]+)(\d+)/);
    if (!match) return { row: 1, col: 1 };
    return { col: columnToNumber(match[1]), row: parseInt(match[2], 10) };
  };

  return (
    <div className="w-full h-full overflow-auto relative" onMouseUp={handleMouseUp}>
      <div
        className="grid absolute"
        style={{
          gridTemplateColumns: `40px repeat(${sheet.columnCount}, 120px)`,
          gridTemplateRows: `30px repeat(${sheet.rowCount}, 28px)`,
        }}
      >
        {renderGrid()}
      </div>
    </div>
  );
};

export default Grid;