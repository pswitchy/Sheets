// src/components/Spreadsheet/ChartDialog.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChartConfig, ChartType } from '@/types/chart';
import { SpreadsheetData, Sheet, SelectionState } from '@/types/spreadsheet';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChartPreview } from './ChartPreview';
import { generateChartData } from '@/lib/chart-utils';
import { Label } from '@/components/ui/label';

interface ChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChart: (config: ChartConfig) => void;
  selectedRange: string;
  data: SpreadsheetData;
  sheet: Sheet;
  selection: SelectionState;
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
    type: 'bar',
    title: '',
    dataRange: selectedRange,
    options: {
      axisTitle: { x: '', y: '' },
      showLegend: true,
      showGrid: true,
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    },
  });

  // Update dataRange when the dialog opens with a new selection
  useEffect(() => {
    if (isOpen) {
      setChartConfig(prev => ({ ...prev, dataRange: selectedRange }));
    }
  }, [isOpen, selectedRange]);

  const handleCreate = useCallback(() => {
    if (!chartConfig.title.trim() || !chartConfig.dataRange.trim()) {
        // You can add a toast message here for user feedback
        return;
    };
    onCreateChart(chartConfig);
    onClose();
  }, [chartConfig, onCreateChart, onClose]);

  const chartData = useMemo(() => {
    // Only generate chart data if the config is valid
    if(chartConfig.dataRange.includes(':')) {
        return generateChartData(data, chartConfig);
    }
    return { labels: [], datasets: [] };
  }, [data, chartConfig]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chart Editor</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Controls */}
          <div className="col-span-1 overflow-y-auto pr-4">
            <Tabs defaultValue="setup">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger value="customize">Customize</TabsTrigger>
              </TabsList>
              <TabsContent value="setup" className="space-y-4 pt-4">
                <div className="space-y-1">
                  <Label>Chart Type</Label>
                  <Select value={chartConfig.type} onValueChange={(v) => setChartConfig(p => ({ ...p, type: v as ChartType }))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="pie">Pie</SelectItem>
                      <SelectItem value="scatter">Scatter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Data Range</Label>
                  <Input value={chartConfig.dataRange} onChange={(e) => setChartConfig(p => ({ ...p, dataRange: e.target.value }))} placeholder="e.g., A1:B10" />
                </div>
              </TabsContent>
              <TabsContent value="customize" className="space-y-4 pt-4">
                <div className="space-y-1">
                    <Label>Chart Title</Label>
                    <Input value={chartConfig.title} onChange={(e) => setChartConfig(p => ({ ...p, title: e.target.value }))} placeholder="My Awesome Chart" />
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="showLegend" checked={chartConfig.options.showLegend} onCheckedChange={(c) => setChartConfig(p => ({ ...p, options: {...p.options, showLegend: !!c} }))} />
                    <Label htmlFor="showLegend">Show Legend</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="showGrid" checked={chartConfig.options.showGrid} onCheckedChange={(c) => setChartConfig(p => ({ ...p, options: {...p.options, showGrid: !!c} }))} />
                    <Label htmlFor="showGrid">Show Grid Lines</Label>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Preview */}
          <div className="col-span-2 bg-gray-50 rounded-md p-4">
            <ChartPreview config={chartConfig} data={chartData} />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate}>Insert Chart</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChartDialog;