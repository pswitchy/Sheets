// src/pages/spreadsheet/[id].tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useRouter } from 'next/router';
import { Menu } from '@/components/Spreadsheet/Menu';
import { Toolbar } from '@/components/Spreadsheet/Toolbar';
import { Grid } from '@/components/Spreadsheet/Grid';
import FormulaBar from '@/components/Spreadsheet/FormulaBar';
import { ChartDialog } from '@/components/Spreadsheet/ChartDialog';
import { SheetTabs } from '@/components/Spreadsheet/SheetTabs';
import { StatusBar } from '@/components/Spreadsheet/StatusBar';
import { SpreadsheetData, CellFormat, SelectionState } from '@/types/spreadsheet';
import { spreadsheetService } from '@/services/spreadsheetService';
import { toast } from 'react-hot-toast';
import { useHotkeys } from 'react-hotkeys-hook';
import { Loader2 } from 'lucide-react';
import { ChartConfig } from '@/types/chart';
import { useSpreadsheet } from '@/hooks/useSpreadsheet';
import { useAutosave } from '@/hooks/useAutosave';
import { SpreadsheetContextMenu } from '@/components/Spreadsheet/ContextMenu';
import { SpreadsheetLayout } from '@/components/layouts/SpreadsheetLayout';
import { columnToNumber, numberToColumn } from '@/lib/utils';

function SpreadsheetPage() {
  const router = useRouter();
  const { id: spreadsheetId } = router.query;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChartDialogOpen, setIsChartDialogOpen] = useState(false);

  const {
    data,
    setData,
    activeSheet,
    selection,
    setSelection,
    updateCell,
    formatCells,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    setActiveSheetId,
    recalculateSheet,
    cutCells,
    copyCells,
    pasteCells,
    clearCells,
    addSheet,
    deleteSheet,
    renameSheet,
  } = useSpreadsheet();

  // Data Fetching
  useEffect(() => {
    const loadSpreadsheet = async () => {
      if (!spreadsheetId) return;
      setIsLoading(true);
      try {
        const loadedData = await spreadsheetService.getSpreadsheet(spreadsheetId as string);
        if (loadedData && Array.isArray(loadedData.sheets)) {
          const recalculatedSheets = loadedData.sheets.map(sheet => recalculateSheet(sheet));
          setData({ ...loadedData, sheets: recalculatedSheets });
        } else {
          throw new Error("Spreadsheet data is malformed and does not contain sheets.");
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load spreadsheet.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    loadSpreadsheet();
  }, [spreadsheetId, setData, recalculateSheet]);

  // Autosave
  useAutosave(data, async (dataToSave) => {
    if (!spreadsheetId || isLoading) return;
    try {
      await spreadsheetService.updateSpreadsheet(spreadsheetId as string, dataToSave);
    } catch (err) {
      console.error('Autosave failed:', err);
      toast.error('Auto-save failed.');
    }
  }, 2000);

  // Memoized derived state for performance
  const currentFormat = useMemo<CellFormat>(() => {
    return activeSheet?.cells[selection.start]?.format || {};
  }, [selection.start, activeSheet]);

  const formulaBarValue = useMemo(() => {
    const cell = activeSheet?.cells[selection.start];
    return cell?.formula || cell?.value || '';
  }, [selection.start, activeSheet]);

  const parseCellRef = (ref: string): { row: number; col: number } | null => {
    const match = ref.match(/([A-Z]+)(\d+)/);
    if (!match) return null;
    return { col: columnToNumber(match[1]), row: parseInt(match[2], 10) };
  };

  const selectionCalculations = useMemo(() => {
    if (!selection.start || !activeSheet) return null;
    
    const startRef = parseCellRef(selection.start);
    const endRef = parseCellRef(selection.end);
    if (!startRef || !endRef) return null;

    let sum = 0;
    let count = 0;
    let numbers: number[] = [];

    const minRow = Math.min(startRef.row, endRef.row);
    const maxRow = Math.max(startRef.row, endRef.row);
    const minCol = Math.min(startRef.col, endRef.col);
    const maxCol = Math.max(startRef.col, endRef.col);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const cellRef = `${numberToColumn(c)}${r}`;
        const cell = activeSheet.cells[cellRef];
        if (cell && (cell.value || cell.calculatedValue)) {
          const valueToConsider = cell.calculatedValue || cell.value;
          if (valueToConsider) {
            count++;
            const numValue = parseFloat(valueToConsider);
            if (!isNaN(numValue)) {
              numbers.push(numValue);
            }
          }
        }
      }
    }
    
    if (numbers.length === 0) return { sum: 0, average: 0, count };

    sum = numbers.reduce((a, b) => a + b, 0);
    const average = sum / numbers.length;

    return { sum, average, count };

  }, [selection, activeSheet]);

  // Callbacks
  const handleCreateChart = useCallback((config: ChartConfig) => {
    setData(prev => ({
      ...prev,
      charts: [...(prev.charts || []), { ...config, id: `chart-${Date.now()}` }]
    }));
    setIsChartDialogOpen(false);
  }, [setData]);

  // Keyboard Shortcuts
  useHotkeys('ctrl+b, cmd+b', (e) => { e.preventDefault(); formatCells({ bold: !currentFormat.bold }); }, [currentFormat, formatCells]);
  useHotkeys('ctrl+i, cmd+i', (e) => { e.preventDefault(); formatCells({ italic: !currentFormat.italic }); }, [currentFormat, formatCells]);
  useHotkeys('ctrl+u, cmd+u', (e) => { e.preventDefault(); formatCells({ underline: !currentFormat.underline }); }, [currentFormat, formatCells]);
  useHotkeys('ctrl+x, cmd+x', (e) => { e.preventDefault(); cutCells(); toast('Cut to clipboard'); }, [cutCells]);
  useHotkeys('ctrl+c, cmd+c', (e) => { e.preventDefault(); copyCells(); toast('Copied to clipboard'); }, [copyCells]);
  useHotkeys('ctrl+v, cmd+v', (e) => { e.preventDefault(); pasteCells(); }, [pasteCells]);
  useHotkeys('backspace, delete', (e) => { e.preventDefault(); clearCells(); }, [clearCells]);

  // Render Logic
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  }

  if (error || !activeSheet) {
    return (
      <div className="h-screen flex items-center justify-center text-center text-red-500 p-4">
        <div>
            <h2 className="text-lg font-semibold">{error || "An unexpected error occurred."}</h2>
            <p className="text-sm">{!activeSheet && "Could not find an active sheet to display."}</p>
        </div>
      </div>
    );
  }

  return (
    <SpreadsheetLayout>
      <Menu
        spreadsheetId={spreadsheetId as string}
        spreadsheetData={data}
        onDataChange={setData}
        selectedRange={selection.end ? `${selection.start}:${selection.end}` : selection.start}
        onCut={cutCells}
        onCopy={copyCells}
        onPaste={pasteCells}
      />
      <Toolbar
        onFormatChange={formatCells}
        onAddRow={addRow}
        onDeleteRow={deleteRow}
        onAddColumn={addColumn}
        onDeleteColumn={deleteColumn}
        currentFormat={currentFormat}
        selectedRange={selection.end ? `${selection.start}:${selection.end}` : selection.start}
        spreadsheetId={spreadsheetId as string}
        selection={selection}
      />
      <FormulaBar
        value={formulaBarValue}
        onChange={(value) => selection.start && updateCell(selection.start, value)}
        selectedCell={selection.start}
      />
      <div className="flex-1 relative overflow-hidden">
        <SpreadsheetContextMenu
          onCut={() => { cutCells(); toast('Cut to clipboard'); }}
          onCopy={() => { copyCells(); toast('Copied to clipboard'); }}
          onPaste={pasteCells}
          onDelete={clearCells}
          onFormat={(format) => formatCells({ [format]: !currentFormat[format as keyof CellFormat] } as Partial<CellFormat>)}
          onCreateChart={() => setIsChartDialogOpen(true)}
          onFilter={() => { /* Implement filter logic in useSpreadsheet and call here */ }}
        >
          <Grid
            sheet={activeSheet}
            selection={selection}
            onSelectionChange={setSelection}
            onCellChange={updateCell}
            onCellFormatChange={(cellRef, format) => formatCells(format)}
            currentFormat={currentFormat}
          />
        </SpreadsheetContextMenu>
      </div>
      <SheetTabs
        sheets={data.sheets}
        activeSheet={data.activeSheetId || ''}
        onSheetSelect={setActiveSheetId}
        onAddSheet={addSheet}
        onRenameSheet={renameSheet}
        onDeleteSheet={deleteSheet}
        onSheetChange={setActiveSheetId}
      />
      <StatusBar calculations={selectionCalculations} />
      <ChartDialog
        isOpen={isChartDialogOpen}
        onClose={() => setIsChartDialogOpen(false)}
        onCreateChart={handleCreateChart}
        selectedRange={selection.end ? `${selection.start}:${selection.end}` : selection.start}
        data={data}
        sheet={activeSheet}
        selection={selection}
      />
    </SpreadsheetLayout>
  );
}

export default function SpreadsheetPageWithBoundary() {
  return (
    <ErrorBoundary>
      <SpreadsheetPage />
    </ErrorBoundary>
  );
}