// src/components/Spreadsheet/SheetTabs.tsx

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Sheet {
  id: string;
  name: string;
  isActive: boolean;
}

interface SheetTabsProps {
  activeSheet: string;
  sheets: Sheet[];
  onSheetSelect: (sheetId: string) => void;
  onAddSheet: () => void;
  onRenameSheet: (sheetId: string, newName: string) => void;
  onDeleteSheet: (sheetId: string) => void;
  onSheetChange: (sheetId: string) => void; // Provided for compatibility
}

export const SheetTabs: React.FC<SheetTabsProps> = ({
  sheets,
  onSheetSelect,
  onAddSheet,
  onRenameSheet,
  onDeleteSheet,
}) => {
  const [editingSheet, setEditingSheet] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const handleDoubleClick = (sheet: Sheet) => {
    setEditingSheet(sheet.id);
    setNewName(sheet.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent, sheetId: string) => {
    if (e.key === 'Enter') {
      onRenameSheet(sheetId, newName);
      setEditingSheet(null);
    } else if (e.key === 'Escape') {
      setEditingSheet(null);
    }
  };
  
  const handleBlur = () => {
      if(editingSheet && newName) {
        onRenameSheet(editingSheet, newName);
      }
      setEditingSheet(null);
  }

  return (
    <div className="flex items-center border-t bg-gray-100 h-9 px-2">
      <div className="flex items-center overflow-x-auto">
        {sheets.map((sheet) => (
          <div
            key={sheet.id}
            className={cn(
              "group relative flex items-center h-full px-4 border-r border-gray-200 cursor-pointer whitespace-nowrap",
              sheet.isActive ? "bg-white text-blue-600 font-medium" : "bg-gray-100 hover:bg-gray-200"
            )}
            onClick={() => onSheetSelect(sheet.id)}
            onDoubleClick={() => handleDoubleClick(sheet)}
          >
            {editingSheet === sheet.id ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, sheet.id)}
                onBlur={handleBlur}
                className="w-24 px-1 bg-white border rounded outline-blue-500 text-sm"
                autoFocus
              />
            ) : (
              <>
                <span className="text-sm">{sheet.name}</span>
                {sheets.length > 1 && (
                  <button
                    className="ml-2 opacity-0 group-hover:opacity-100 rounded-full hover:bg-gray-300 p-0.5"
                    onClick={(e) => { e.stopPropagation(); onDeleteSheet(sheet.id); }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 ml-2" onClick={onAddSheet}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SheetTabs;