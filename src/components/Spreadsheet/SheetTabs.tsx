// src/components/Spreadsheet/SheetTabs.tsx
import React, { useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown';

interface Sheet {
  id: string;
  name: string;
  isActive: boolean;
}

interface SheetTabsProps {
  activeSheet: string;
  sheets: { id: string; name: string; isActive: boolean }[];
  onSheetChange: (sheetId: string) => void;
  onSheetSelect: (sheetId: string) => void;
  onAddSheet: () => void;
  onRenameSheet: (sheetId: string, newName: string) => void;
  onDeleteSheet: (sheetId: string) => void;
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
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleDoubleClick = (sheetId: string, name: string) => {
    setEditingSheet(sheetId);
    setNewName(name);
  };

  const handleKeyDown = (e: React.KeyboardEvent, sheetId: string) => {
    if (e.key === 'Enter') {
      onRenameSheet(sheetId, newName);
      setEditingSheet(null);
    } else if (e.key === 'Escape') {
      setEditingSheet(null);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('sheet-tabs-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      setScrollPosition(Math.max(0, scrollPosition + scrollAmount));
      container.scrollTo({
        left: scrollPosition + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="flex items-center border-t bg-gray-50 h-9">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => handleScroll('left')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div
        id="sheet-tabs-container"
        className="flex-1 overflow-hidden whitespace-nowrap"
      >
        <div
          className="flex"
          style={{ transform: `translateX(-${scrollPosition}px)` }}
        >
          {sheets.map((sheet) => (
            <div
              key={sheet.id}
              className={cn(
                "group relative inline-flex items-center h-8 px-4 border-r border-t border-gray-200 cursor-pointer",
                sheet.isActive && "bg-white border-t-2 border-t-blue-500",
                !sheet.isActive && "bg-gray-100 hover:bg-gray-50"
              )}
              onClick={() => onSheetSelect(sheet.id)}
              onDoubleClick={() => handleDoubleClick(sheet.id, sheet.name)}
            >
              {editingSheet === sheet.id ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, sheet.id)}
                  onBlur={() => setEditingSheet(null)}
                  className="w-20 px-1 bg-white border rounded outline-none"
                  autoFocus
                />
              ) : (
                <>
                  <span className="text-sm">{sheet.name}</span>
                  {sheets.length > 1 && (
                    <button
                      className="ml-2 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSheet(sheet.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => handleScroll('right')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={onAddSheet}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SheetTabs;