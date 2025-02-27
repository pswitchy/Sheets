// src/components/Spreadsheet/FilterDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (config: FilterConfig) => void;
  selectedRange: string;
}

export interface FilterConfig {
  column: string;
  condition: FilterCondition;
  value: string;
  value2?: string;  // For 'between' condition
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

const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  onClose,
  onApplyFilter,
  selectedRange,
}) => {
  const [config, setConfig] = useState<FilterConfig>({
    column: selectedRange.split(':')[0].replace(/[0-9]/g, ''),
    condition: 'equals',
    value: '',
  });

  const handleApply = () => {
    onApplyFilter(config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Filter</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Column</Label>
            <Select
              value={config.column}
              onValueChange={(value) => setConfig({ ...config, column: value })}
            >
              {/* Generate options A-Z */}
              {Array.from({ length: 26 }, (_, i) => (
                <option key={i} value={String.fromCharCode(65 + i)}>
                  Column {String.fromCharCode(65 + i)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Condition</Label>
            <Select
              value={config.condition}
              onValueChange={(value) => 
                setConfig({ ...config, condition: value as FilterCondition })}
            >
              <option value="equals">Equals</option>
              <option value="not_equals">Does not equal</option>
              <option value="contains">Contains</option>
              <option value="not_contains">Does not contain</option>
              <option value="greater">Greater than</option>
              <option value="less">Less than</option>
              <option value="between">Between</option>
              <option value="empty">Is empty</option>
              <option value="not_empty">Is not empty</option>
            </Select>
          </div>

          {!['empty', 'not_empty'].includes(config.condition) && (
            <div>
              <Label>Value</Label>
              <Input
                value={config.value}
                onChange={(e) => setConfig({ ...config, value: e.target.value })}
                placeholder="Enter value"
              />
              {config.condition === 'between' && (
                <div className="mt-2">
                  <Label>End Value</Label>
                  <Input
                    value={config.value2 || ''}
                    onChange={(e) =>
                      setConfig({ ...config, value2: e.target.value })
                    }
                    placeholder="Enter end value"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Filter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;