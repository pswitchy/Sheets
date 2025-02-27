// src/lib/cell-utils.ts

import { CellPosition } from '@/types/spreadsheet';

export const cellUtils = {
  columnToIndex: (column: string): number => {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      index = index * 26 + column.charCodeAt(i) - 64;
    }
    return index - 1;
  },

  indexToColumn: (index: number): string => {
    let column = '';
    index++;
    while (index > 0) {
      const remainder = (index - 1) % 26;
      column = String.fromCharCode(65 + remainder) + column;
      index = Math.floor((index - 1) / 26);
    }
    return column;
  },

  parsePosition: (cellId: string): CellPosition => {
    const match = cellId.match(/([A-Z]+)(\d+)/);
    if (!match) throw new Error('Invalid cell ID');
    return {
      column: match[1],
      row: parseInt(match[2], 10),
    };
  },

  positionToId: (position: CellPosition): string => {
    return `${position.column}${position.row}`;
  },

  parseRange: (range: string): CellPosition[] => {
    const [start, end] = range.split(':');
    const startPos = cellUtils.parsePosition(start);
    const endPos = cellUtils.parsePosition(end);
    
    const cells: CellPosition[] = [];
    const startCol = cellUtils.columnToIndex(startPos.column);
    const endCol = cellUtils.columnToIndex(endPos.column);
    
    for (let row = startPos.row; row <= endPos.row; row++) {
      for (let col = startCol; col <= endCol; col++) {
        cells.push({
          column: cellUtils.indexToColumn(col),
          row,
        });
      }
    }
    
    return cells;
  },
};