export interface Spreadsheet {
    id: string;
    name: string;
    data: {
      cells: Record<string, CellData>;
      rowCount: number;
      columnCount: number;
    };
    userId: string;
    isPublic: boolean;
    version: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CellData {
    value: string | number;
    format?: CellFormat;
  }
  
  export interface CellFormat {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    align?: 'left' | 'center' | 'right';
    textColor?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
  }
  
export interface SpreadsheetListItem {
  id: string;
  name: string;
  updatedAt: string; // or Date
}