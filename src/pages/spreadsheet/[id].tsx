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
import { useToast } from '@/hooks/useToast';
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
  const { showToast } = useToast();

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
  } = useSpreadsheet();

  // Load initial data from the server
  useEffect(() => {
    const loadSpreadsheet = async () => {
      if (!spreadsheetId) return;
      setIsLoading(true);
      try {
        const loadedData = await spreadsheetService.getSpreadsheet(spreadsheetId as string);
        // Recalculate all sheets on initial load to ensure computed values are up to date
        const recalculatedSheets = loadedData.sheets.map(sheet => recalculateSheet(sheet));
        setData({ ...loadedData, sheets: recalculatedSheets });
      } catch (err) {
        setError('Failed to load spreadsheet.');
        showToast({ variant: 'error', title: 'Failed to load spreadsheet' });
      } finally {
        setIsLoading(false);
      }
    };
    loadSpreadsheet();
  }, [spreadsheetId, setData, recalculateSheet, showToast]);

  // Autosave data whenever it changes (with a debounce)
  useAutosave(data, async (dataToSave) => {
    if (!spreadsheetId || isLoading) return;
    try {
      await spreadsheetService.updateSpreadsheet(spreadsheetId as string, dataToSave);
    } catch (err) {
      console.error('Autosave failed:', err);
      showToast({ variant: 'error', title: 'Failed to save changes automatically' });
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

  // Keyboard shortcuts
  useHotkeys('ctrl+b, cmd+b', (e) => { e.preventDefault(); formatCells({ bold: !currentFormat.bold }) }, [currentFormat, formatCells]);
  useHotkeys('ctrl+i, cmd+i', (e) => { e.preventDefault(); formatCells({ italic: !currentFormat.italic }) }, [currentFormat, formatCells]);
  useHotkeys('ctrl+u, cmd+u', (e) => { e.preventDefault(); formatCells({ underline: !currentFormat.underline }) }, [currentFormat, formatCells]);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  }

  if (error || !activeSheet) {
    return <div className="h-screen flex items-center justify-center text-red-500">{error || "An unexpected error occurred: Active sheet not found."}</div>;
  }

  return (
    <SpreadsheetLayout>
      <Menu
        spreadsheetId={spreadsheetId as string}
        spreadsheetData={data}
        onDataChange={setData}
        selectedRange={selection.end ? `${selection.start}:${selection.end}` : selection.start}
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
          onCut={() => { /* Implement clipboard logic */ }}
          onCopy={() => { /* Implement clipboard logic */ }}
          onPaste={() => { /* Implement clipboard logic */ }}
          onDelete={() => { /* Implement clear cell values logic */ }}
          onFormat={(format) => formatCells({ [format]: !currentFormat[format as keyof CellFormat] } as Partial<CellFormat>)}
          onCreateChart={() => setIsChartDialogOpen(true)}
          onFilter={() => { /* Implement filter logic */ }}
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
        onAddSheet={() => { /* Implement add sheet logic in useSpreadsheet hook */ }}
        onRenameSheet={() => { /* Implement rename sheet logic in useSpreadsheet hook */ }}
        onDeleteSheet={() => { /* Implement delete sheet logic in useSpreadsheet hook */ }}
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

// The wrapper is essential because useToast needs to be inside the ToastProvider
export default function SpreadsheetPageWrapper() {
  return (
    <ErrorBoundary>
      <SpreadsheetPage />
    </ErrorBoundary>
  );
}