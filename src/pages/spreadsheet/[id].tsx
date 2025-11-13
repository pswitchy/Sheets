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

function SpreadsheetPage() {
  const router = useRouter();
  const { id: spreadsheetId } = router.query;
  // const { showToast } = useToast();

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

  useEffect(() => {
    const loadSpreadsheet = async () => {
      if (!spreadsheetId) return;
      setIsLoading(true);
      try {
        const loadedData = await spreadsheetService.getSpreadsheet(spreadsheetId as string);

        // ✅ SAFETY CHECK: Ensure sheets is an array before mapping
        if (loadedData && Array.isArray(loadedData.sheets)) {
          const recalculatedSheets = loadedData.sheets.map(sheet => recalculateSheet(sheet));
          setData({ ...loadedData, sheets: recalculatedSheets });
        } else {
          // If data is malformed, throw an error to be caught below
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

  useAutosave(data, async (dataToSave) => {
    if (!spreadsheetId || isLoading) return;
    try {
      await spreadsheetService.updateSpreadsheet(spreadsheetId as string, dataToSave);
    } catch (err) {
      console.error('Autosave failed:', err);
      toast.error('Failed to autosave changes.');
    }
  }, 2000);

  const currentFormat = useMemo<CellFormat>(() => {
    return activeSheet?.cells[selection.start]?.format || {};
  }, [selection.start, activeSheet]);

  const formulaBarValue = useMemo(() => {
    const cell = activeSheet?.cells[selection.start];
    return cell?.formula || cell?.value || '';
  }, [selection.start, activeSheet]);

  const handleCreateChart = useCallback((config: ChartConfig) => {
    setData(prev => ({
      ...prev,
      charts: [...(prev.charts || []), { ...config, id: `chart-${Date.now()}` }]
    }));
    setIsChartDialogOpen(false);
  }, [setData]);

  useHotkeys('ctrl+b, cmd+b', (e) => { e.preventDefault(); formatCells({ bold: !currentFormat.bold }) }, [currentFormat, formatCells]);
  useHotkeys('ctrl+i, cmd+i', (e) => { e.preventDefault(); formatCells({ italic: !currentFormat.italic }) }, [currentFormat, formatCells]);
  useHotkeys('ctrl+u, cmd+u', (e) => { e.preventDefault(); formatCells({ underline: !currentFormat.underline }) }, [currentFormat, formatCells]);
  useHotkeys('ctrl+x, cmd+x', (e) => { e.preventDefault(); cutCells() }, [cutCells]);
  useHotkeys('ctrl+c, cmd+c', (e) => { e.preventDefault(); copyCells() }, [copyCells]);
  useHotkeys('ctrl+v, cmd+v', (e) => { e.preventDefault(); pasteCells() }, [pasteCells]);

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
          onCut={cutCells}
          onCopy={copyCells}
          onPaste={pasteCells}
          onDelete={clearCells}
          onFormat={(format) => formatCells({ [format]: !currentFormat[format as keyof CellFormat] } as Partial<CellFormat>)}
          onCreateChart={() => setIsChartDialogOpen(true)}
          onFilter={() => {}}
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