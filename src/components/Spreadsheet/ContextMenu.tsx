// src/components/Spreadsheet/ContextMenu.tsx
import React from 'react';
import {
  ContextMenu as ContextMenuPrimitive,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger, // Make sure to import the Trigger
} from '@/components/ui/context-menu';
import {
  Scissors,
  Copy,
  ClipboardPaste,
  Trash,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChartBar,
  Filter,
  Type,
} from 'lucide-react';

interface ContextMenuProps {
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onFormat: (format: string) => void;
  onCreateChart: () => void;
  onFilter: () => void;
  children: React.ReactNode;
}

export const SpreadsheetContextMenu: React.FC<ContextMenuProps> = ({
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onFormat,
  onCreateChart,
  onFilter,
  children,
}) => {
  return (
    <ContextMenuPrimitive>
      {/* The trigger wraps the component that should open the menu (the Grid) */}
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={onCut}>
          <Scissors className="w-4 h-4 mr-2" />
          Cut
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onCopy}>
          <Copy className="w-4 h-4 mr-2" />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onPaste}>
          <ClipboardPaste className="w-4 h-4 mr-2" />
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Type className="w-4 h-4 mr-2" />
            Format
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem onClick={() => onFormat('bold')}>
              <Bold className="w-4 h-4 mr-2" />
              Bold
              <ContextMenuShortcut>⌘B</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onFormat('italic')}>
              <Italic className="w-4 h-4 mr-2" />
              Italic
              <ContextMenuShortcut>⌘I</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onFormat('align-left')}>
              <AlignLeft className="w-4 h-4 mr-2" />
              Align Left
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onFormat('align-center')}>
              <AlignCenter className="w-4 h-4 mr-2" />
              Align Center
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onFormat('align-right')}>
              <AlignRight className="w-4 h-4 mr-2" />
              Align Right
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem onClick={onCreateChart}>
          <ChartBar className="w-4 h-4 mr-2" />
          Insert Chart
        </ContextMenuItem>

        <ContextMenuItem onClick={onFilter}>
          <Filter className="w-4 h-4 mr-2" />
          Add Filter
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={onDelete} className="text-red-600">
          <Trash className="w-4 h-4 mr-2" />
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenuPrimitive>
  );
};

export default SpreadsheetContextMenu;