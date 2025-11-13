// src/components/Spreadsheet/Toolbar.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ColorPicker } from '@/components/ui/color-picker';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Plus, Minus, Palette } from 'lucide-react';
import { CellFormat, SelectionState } from '@/types/spreadsheet';

interface ToolbarProps {
  onFormatChange: (format: Partial<CellFormat>) => void;
  onAddRow: () => void;
  onDeleteRow: () => void;
  onAddColumn: () => void;
  onDeleteColumn: () => void;
  currentFormat: CellFormat;
  selection: SelectionState;
  spreadsheetId: string;
  selectedRange: string;
}

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 36, 48];
const fontFamilies = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New'];

export const Toolbar: React.FC<ToolbarProps> = ({
  onFormatChange,
  onAddRow,
  onDeleteRow,
  onAddColumn,
  onDeleteColumn,
  currentFormat,
}) => {
  return (
    <div className="flex items-center gap-1 p-1 border-b bg-white flex-wrap">
      <Select
        value={currentFormat.fontFamily || 'Arial'}
        onValueChange={(value) => onFormatChange({ fontFamily: value })}
      >
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {fontFamilies.map((font) => (
            <SelectItem key={font} value={font} style={{ fontFamily: font }}>{font}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(currentFormat.fontSize || 11)}
        onValueChange={(value) => onFormatChange({ fontSize: Number(value) })}
      >
        <SelectTrigger className="w-16 h-8 text-xs">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {fontSizes.map((size) => (
            <SelectItem key={size} value={String(size)}>{size}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Toggle size="sm" pressed={currentFormat.bold} onPressedChange={(p) => onFormatChange({ bold: p })}>
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={currentFormat.italic} onPressedChange={(p) => onFormatChange({ italic: p })}>
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={currentFormat.underline} onPressedChange={(p) => onFormatChange({ underline: p })}>
        <Underline className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Text Color</label>
              <ColorPicker color={currentFormat.textColor || '#000000'} onChange={(c) => onFormatChange({ textColor: c })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Background</label>
              <ColorPicker color={currentFormat.backgroundColor || '#ffffff'} onChange={(c) => onFormatChange({ backgroundColor: c })} />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <Toggle size="sm" pressed={currentFormat.textAlign === 'left'} onPressedChange={() => onFormatChange({ textAlign: 'left' })}><AlignLeft className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={currentFormat.textAlign === 'center'} onPressedChange={() => onFormatChange({ textAlign: 'center' })}><AlignCenter className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={currentFormat.textAlign === 'right'} onPressedChange={() => onFormatChange({ textAlign: 'right' })}><AlignRight className="h-4 w-4" /></Toggle>
      
      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button variant="ghost" size="sm" onClick={onAddRow}><Plus className="h-4 w-4 mr-1" /> Row</Button>
      <Button variant="ghost" size="sm" onClick={onDeleteRow}><Minus className="h-4 w-4 mr-1" /> Row</Button>
      <Button variant="ghost" size="sm" onClick={onAddColumn}><Plus className="h-4 w-4 mr-1" /> Col</Button>
      <Button variant="ghost" size="sm" onClick={onDeleteColumn}><Minus className="h-4 w-4 mr-1" /> Col</Button>
    </div>
  );
};

export default Toolbar;