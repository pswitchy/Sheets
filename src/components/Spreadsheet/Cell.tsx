// src/components/Spreadsheet/Cell.tsx

import React, { useState, useRef, useEffect } from 'react';
import { CellFormat } from '@/types/spreadsheet';
import { cn } from '@/lib/utils';

interface CellProps {
  cellRef: string;
  value: string;
  formula?: string;
  format: CellFormat;
  isSelected: boolean;
  isInSelection: boolean;
  onChange: (value: string) => void;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  isHeader: boolean;
}

export const Cell: React.FC<CellProps> = ({
  value,
  formula,
  format,
  isSelected,
  isInSelection,
  onChange,
  onMouseDown,
  onMouseEnter,
  isHeader,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(formula || value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // When the cell is selected but not editing, update its display value from props
    if (!isEditing) {
      setEditValue(formula || value);
    }
  }, [value, formula, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!isHeader) {
      setIsEditing(true);
      // When starting to edit, show the formula if it exists, otherwise the value
      setEditValue(formula || value);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Only call the expensive parent state update when editing is finished
    if (editValue !== (formula || value)) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur(); // Commit the change
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false); // Discard the change
      setEditValue(formula || value); // Revert local state
    }
  };

  return (
    <div
      className={cn(
        'relative h-full w-full px-2 py-1 overflow-hidden text-ellipsis whitespace-nowrap',
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
        fontSize: `${format.fontSize || 11}px`,
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
            'absolute inset-0 w-full h-full px-2 border-none outline-none bg-white z-20',
            'focus:ring-0' // Ensure no extra rings on the input itself
          )}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        value // Display the final calculated value
      )}
    </div>
  );
};

export default Cell;