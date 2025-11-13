// src/components/Spreadsheet/FilterDialog.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export interface FilterConfig {
  column: string;
  condition: FilterCondition;
  value: string;
  value2?: string;
}

type FilterCondition =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater'
  | 'less'
  | 'between'
  | 'empty'
  | 'not_empty';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (config: FilterConfig) => void;
  selectedRange: string;
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  onClose,
  onApplyFilter,
  selectedRange,
}) => {
  const [config, setConfig] = useState<FilterConfig>({
    column: 'A',
    condition: 'equals',
    value: '',
  });

  // When the dialog opens, set the initial column based on the selection
  useEffect(() => {
    if (isOpen) {
      const startColumn = selectedRange.match(/[A-Z]+/)?.[0] || 'A';
      setConfig(prev => ({ ...prev, column: startColumn }));
    }
  }, [isOpen, selectedRange]);

  const handleApply = () => {
    onApplyFilter(config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Filter</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Column</Label>
            <Select value={config.column} onValueChange={(value) => setConfig({ ...config, column: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a column..." />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(col => (
                  <SelectItem key={col} value={col}>Column {col}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Condition</Label>
            <Select value={config.condition} onValueChange={(value) => setConfig({ ...config, condition: value as FilterCondition })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a condition..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="not_equals">Does not equal</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="not_contains">Does not contain</SelectItem>
                <SelectItem value="greater">Greater than</SelectItem>
                <SelectItem value="less">Less than</SelectItem>
                <SelectItem value="between">Between</SelectItem>
                <SelectItem value="empty">Is empty</SelectItem>
                <SelectItem value="not_empty">Is not empty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!['empty', 'not_empty'].includes(config.condition) && (
            <div className="space-y-2">
              <Label>Value</Label>
              <Input
                value={config.value}
                onChange={(e) => setConfig({ ...config, value: e.target.value })}
                placeholder="Enter value"
              />
              {config.condition === 'between' && (
                <div className="mt-2 space-y-2">
                  <Label>And</Label>
                  <Input
                    value={config.value2 || ''}
                    onChange={(e) => setConfig({ ...config, value2: e.target.value })}
                    placeholder="Enter end value"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApply}>Apply Filter</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;