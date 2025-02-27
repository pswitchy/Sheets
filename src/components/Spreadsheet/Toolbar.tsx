// src/components/Spreadsheet/Toolbar.tsx

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { ColorPicker } from '@/components/ui/color-picker';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Minus,
  Type,
  Palette,
  FunctionSquare,
} from 'lucide-react';
import { CellFormat } from '@/types/spreadsheet';
import { spreadsheetService } from '@/services/spreadsheetService';
import { SelectionState } from '@/types/spreadsheet';

interface ToolbarProps {
  onFormatChange: (format: Partial<CellFormat>) => void;
  onAddRow: () => void;
  onDeleteRow: () => void;
  onAddColumn: () => void;
  onDeleteColumn: () => void;
  currentFormat: CellFormat;
  selectedRange: string;
  spreadsheetId: string;
  selection: SelectionState;
}

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 72];
const fontFamilies = [
  'Arial',
  'Calibri',
  'Times New Roman',
  'Helvetica',
  'Verdana',
  'Georgia',
];

export const Toolbar: React.FC<ToolbarProps> = ({
  onFormatChange,
  onAddRow,
  onDeleteRow,
  onAddColumn,
  onDeleteColumn,
  currentFormat,
  selectedRange,
  spreadsheetId,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFormatChange = useCallback(async (format: Partial<CellFormat>) => {
    if (!selectedRange || isLoading) return;
    
    setIsLoading(true);
    try {
      await onFormatChange(format);
    } catch (error) {
      console.error('Failed to update format:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRange, isLoading, onFormatChange]);

  const handleBatchOperation = useCallback(async (operation: () => Promise<void>) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await operation();
    } catch (error) {
      console.error('Operation failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <div className="flex items-center gap-1 p-1 border-b bg-white">
      <Select
        value={currentFormat.fontFamily || 'Arial'}
        onValueChange={(value) => handleFormatChange({ fontFamily: value })}
        disabled={isLoading}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {fontFamilies.map((font) => (
            <SelectItem key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(currentFormat.fontSize || 11)}
        onValueChange={(value) => handleFormatChange({ fontSize: Number(value) })}
        disabled={isLoading}
      >
        <SelectTrigger className="w-16">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {fontSizes.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6" />

      <Toggle
        pressed={currentFormat.bold}
        onPressedChange={(pressed) => handleFormatChange({ bold: pressed })}
        disabled={isLoading}
        size="sm"
        aria-label="Toggle bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>

      <Toggle
        pressed={currentFormat.italic}
        onPressedChange={(pressed) => handleFormatChange({ italic: pressed })}
        disabled={isLoading}
        size="sm"
        aria-label="Toggle italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>

      <Toggle
        pressed={currentFormat.underline}
        onPressedChange={(pressed) => handleFormatChange({ underline: pressed })}
        disabled={isLoading}
        size="sm"
        aria-label="Toggle underline"
      >
        <Underline className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="w-8" disabled={isLoading}>
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Text Color</label>
              <ColorPicker
                color={currentFormat.textColor || '#000000'}
                onChange={(color) => handleFormatChange({ textColor: color })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Background Color</label>
              <ColorPicker
                color={currentFormat.backgroundColor || '#ffffff'}
                onChange={(color) => handleFormatChange({ backgroundColor: color })}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Toggle
          pressed={currentFormat.textAlign === 'left'}
          onPressedChange={() => handleFormatChange({ textAlign: 'left' })}
          disabled={isLoading}
          size="sm"
          aria-label="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={currentFormat.textAlign === 'center'}
          onPressedChange={() => handleFormatChange({ textAlign: 'center' })}
          disabled={isLoading}
          size="sm"
          aria-label="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={currentFormat.textAlign === 'right'}
          onPressedChange={() => handleFormatChange({ textAlign: 'right' })}
          disabled={isLoading}
          size="sm"
          aria-label="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleBatchOperation(async () => onAddRow())}
        disabled={isLoading}
      >
        <Plus className="h-4 w-4 mr-1" /> Row
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleBatchOperation(async () => onDeleteRow())}
        disabled={isLoading}
      >
        <Minus className="h-4 w-4 mr-1" /> Row
      </Button>

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleBatchOperation(async () => onAddColumn())}
        disabled={isLoading}
      >
        <Plus className="h-4 w-4 mr-1" /> Column
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleBatchOperation(async () => onDeleteColumn())}
        disabled={isLoading}
      >
        <Minus className="h-4 w-4 mr-1" /> Column
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button variant="ghost" size="sm" disabled={isLoading}>
        <FunctionSquare className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Toolbar;