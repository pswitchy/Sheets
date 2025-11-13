// src/components/Spreadsheet/FormulaBar.tsx

import React from 'react';
import { Input } from '@/components/ui/input';
import { FunctionSquare } from 'lucide-react';

interface FormulaBarProps {
  value: string;
  onChange: (value: string) => void;
  selectedCell: string;
}

const FormulaBar: React.FC<FormulaBarProps> = ({
  value,
  onChange,
  selectedCell,
}) => {
  return (
    <div className="flex items-center border-b px-2 py-1 bg-gray-50 h-9">
      <div className="flex items-center justify-center w-20 border-r pr-2 text-sm font-mono text-gray-500">
        {selectedCell || '...'}
      </div>
      <div className="flex-1 ml-2 flex items-center">
        <FunctionSquare className="w-4 h-4 text-gray-400 mr-2" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-7 border-none focus:ring-0 text-sm bg-transparent p-1"
          placeholder="Enter a value or formula"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default FormulaBar;