// src/components/ui/color-picker.tsx
import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverTrigger, PopoverContent } from './popover';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="w-8 h-8 rounded border border-gray-200"
          style={{ backgroundColor: color }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <HexColorPicker color={color} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
};