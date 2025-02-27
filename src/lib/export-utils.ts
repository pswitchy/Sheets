// src/lib/export-utils.ts
// Last Updated: 2025-02-26 17:10:23
// Author: parthsharma-git

import * as XLSX from 'xlsx';
import { SpreadsheetData } from '@/types/spreadsheet';
import { columnToNumber, numberToColumn } from './utils';

export const exportUtils = {
  async toExcel(data: SpreadsheetData, filename: string): Promise<Blob> {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);
    
    // Convert cells to worksheet
    Object.entries(data.cells).forEach(([ref, cell]) => {
      const { column, row } = parseRef(ref);
      const colNum = columnToNumber(column) - 1;
      ws[ref] = {
        t: 's',
        v: cell.value,
        s: convertFormat(cell.format),
      };
    });

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  },

  async toCsv(data: SpreadsheetData, filename: string): Promise<Blob> {
    const rows: string[][] = [];
    
    // Convert cells to CSV format
    for (let r = 1; r <= data.rowCount; r++) {
      const row: string[] = [];
      for (let c = 1; c <= data.columnCount; c++) {
        const ref = `${numberToColumn(c)}${r}`;
        row.push(data.cells[ref]?.value || '');
      }
      rows.push(row);
    }

    const csv = rows.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }
};

function parseRef(ref: string) {
  const match = ref.match(/([A-Z]+)(\d+)/);
  if (!match) throw new Error('Invalid cell reference');
  return {
    column: match[1],
    row: parseInt(match[2], 10),
  };
}

function convertFormat(format: any) {
  return {
    font: {
      bold: format?.bold,
      italic: format?.italic,
      underline: format?.underline,
      name: format?.fontFamily,
      sz: format?.fontSize,
      color: format?.textColor ? { rgb: format.textColor.replace('#', '') } : undefined,
    },
    alignment: {
      horizontal: format?.textAlign,
    },
    fill: format?.backgroundColor ? {
      fgColor: { rgb: format.backgroundColor.replace('#', '') },
    } : undefined,
  };
}