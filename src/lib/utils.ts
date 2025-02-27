// src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCellReference(column: string, row: number): string {
  return `${column}${row}`;
}

export function parseCellReference(reference: string): { column: string; row: number } {
  const match = reference.match(/([A-Z]+)(\d+)/);
  if (!match) throw new Error('Invalid cell reference');
  return {
    column: match[1],
    row: parseInt(match[2], 10),
  };
}

export function columnToNumber(column: string): number {
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    result *= 26;
    result += column.charCodeAt(i) - 64;
  }
  return result;
}

export function numberToColumn(num: number): string {
  let result = '';
  while (num > 0) {
    const remainder = (num - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    num = Math.floor((num - 1) / 26);
  }
  return result;
}