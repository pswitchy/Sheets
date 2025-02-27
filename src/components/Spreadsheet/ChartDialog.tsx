// src/components/Spreadsheet/ChartDialog.tsx
// Last Updated: 2025-02-26 17:07:53
// Author: parthsharma-git

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChartConfig, ChartType } from '@/types/chart';
import { SpreadsheetData } from '@/types/spreadsheet';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChartPreview } from './ChartPreview';
import { generateChartData } from '@/lib/chart-utils';
import { Sheet } from '@/types/spreadsheet';
import { SelectionState } from '@/types/spreadsheet';

interface ChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChart: (config: ChartConfig) => void;
  selectedRange: string;
  data: SpreadsheetData;
  sheet?: Sheet;
  selection?: SelectionState;
}

export const ChartDialog: React.FC<ChartDialogProps> = ({
  isOpen,
  onClose,
  onCreateChart,
  selectedRange,
  data,
}) => {
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    id: `chart-${Date.now()}`,
    type: 'line',
    title: '',
    dataRange: selectedRange,
    options: {
      axisTitle: '',
      showLegend: true,
      showGrid: true,
      xAxis: '',
      yAxis: '',
      colors: ['#4F46E5', '#10B981', '#F59E0B'],
    },
  });

  const handleCreate = useCallback(() => {
    if (!chartConfig.title) return;
    onCreateChart({
      ...chartConfig,
      id: `chart-${Date.now()}`,
    });
    onClose();
  }, [chartConfig, onCreateChart, onClose]);

  const handleCheckboxChange = useCallback((key: 'showLegend' | 'showGrid') => (checked: boolean) => {
    setChartConfig(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: checked,
      },
    }));
  }, []);

  const chartData = generateChartData(data, chartConfig);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Chart</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="data">
          <TabsList>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Chart Type</label>
                <Select
                  value={chartConfig.type}
                  onValueChange={(value: ChartType) => 
                    setChartConfig(prev => ({ ...prev, type: value }))}
                >
                  <option value="line">Line</option>
                  <option value="bar">Bar</option>
                  <option value="pie">Pie</option>
                  <option value="scatter">Scatter</option>
                </Select>
              </div>
              <div>
                <label>Title</label>
                <Input
                  value={chartConfig.title}
                  onChange={(e) => 
                    setChartConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Chart Title"
                />
              </div>
              <div>
                <label>Data Range</label>
                <Input
                  value={chartConfig.dataRange}
                  onChange={(e) => 
                    setChartConfig(prev => ({ ...prev, dataRange: e.target.value }))}
                  placeholder="e.g., A1:B10"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="customize" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Checkbox
                  checked={chartConfig.options.showLegend}
                  onCheckedChange={handleCheckboxChange('showLegend')}
                  label="Show Legend"
                />
              </div>
              <div>
                <Checkbox
                  checked={chartConfig.options.showGrid}
                  onCheckedChange={handleCheckboxChange('showGrid')}
                  label="Show Grid"
                />
              </div>
              <div>
                <label>X-Axis Title</label>
                <Input
                  value={chartConfig.options.xAxis}
                  onChange={(e) =>
                    setChartConfig(prev => ({
                      ...prev,
                      options: {
                        ...prev.options,
                        xAxis: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div>
                <label>Y-Axis Title</label>
                <Input
                  value={chartConfig.options.yAxis}
                  onChange={(e) =>
                    setChartConfig(prev => ({
                      ...prev,
                      options: {
                        ...prev.options,
                        yAxis: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="h-[400px]">
            <ChartPreview
              config={chartConfig}
              data={chartData}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>
            Create Chart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChartDialog;