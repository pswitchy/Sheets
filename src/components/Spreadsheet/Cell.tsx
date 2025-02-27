// src/components/Spreadsheet/Cell.tsx
// Last Updated: 2025-02-26 20:53:13
// Author: parthsharma-git

import React, { useState, useRef, useEffect } from 'react';
import { CellFormat } from '@/types/spreadsheet';
import { cn } from '@/lib/utils';

interface CellProps {
  cellRef: string;
  value: string;
  format: CellFormat;
  isSelected: boolean;
  isInSelection: boolean;
  onChange: (value: string) => void;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  isHeader: boolean;
  formula?: string;
}

export const Cell: React.FC<CellProps> = ({
  cellRef,
  value,
  format,
  isSelected,
  isInSelection,
  onChange,
  onMouseDown,
  onMouseEnter,
  isHeader,
  formula,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!isHeader) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleBlur();
      // Handle tab navigation
    }
  };

  const displayValue = formula ? formula : value;

  return (
    <div
      className={cn(
        'relative h-full w-full',
        'border-r border-b border-gray-200',
        isSelected && 'ring-2 ring-blue-500 ring-inset z-10',
        isInSelection && !isSelected && 'bg-blue-100/50',
        !isEditing && 'select-none',
        isHeader && 'bg-gray-50 font-medium'
      )}
      style={{
        backgroundColor: format.backgroundColor || '#ffffff',
        color: format.textColor || '#000000',
        fontWeight: format.bold ? 'bold' : 'normal',
        fontStyle: format.italic ? 'italic' : 'normal',
        textDecoration: format.underline ? 'underline' : 'none',
        textAlign: format.textAlign || 'left',
        fontSize: `${format.fontSize || 14}px`,
        fontFamily: format.fontFamily || 'Arial',
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className={cn(
            'absolute inset-0 w-full h-full px-2',
            'border-none outline-none bg-white'
          )}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className="w-full h-full px-2 py-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {displayValue}
        </div>
      )}
      {formula && isSelected && (
        <div className="absolute -top-6 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded">
          {formula}
        </div>
      )}
    </div>
  );
};

export default Cell;