// src/components/Spreadsheet/FormulaBar.tsx
import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { FunctionSquare } from 'lucide-react';

interface FormulaBarProps {
  value: string;
  onChange: (value: string) => void;
  selectedCell: string;
  isEditing?: boolean;
}

const FormulaBar: React.FC<FormulaBarProps> = ({
  value,
  onChange,
  selectedCell,
  isEditing = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div className="flex items-center border-b px-2 py-1 bg-white">
      <div className="flex items-center w-24 border-r pr-2">
        <FunctionSquare className="w-4 h-4 text-gray-400 mr-2" />
        <span className="text-sm font-medium text-gray-600">
          {selectedCell}
        </span>
      </div>
      <div className="flex-1 ml-2">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          className="w-full border-none focus:ring-0 text-sm"
          placeholder="Enter formula or value"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default FormulaBar;