// src/pages/spreadsheet/[id].tsx

import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useRouter } from 'next/router';
import { Menu } from '@/components/Spreadsheet/Menu';
import { Toolbar } from '@/components/Spreadsheet/Toolbar';
import { Grid } from '@/components/Spreadsheet/Grid';
import FormulaBar from '@/components/Spreadsheet/FormulaBar';
import { ChartDialog } from '@/components/Spreadsheet/ChartDialog';
import { SheetTabs } from '@/components/Spreadsheet/SheetTabs';
import { SpreadsheetData, CellFormat, SelectionState, Sheet, Cell } from '@/types/spreadsheet';
import { spreadsheetService } from '@/services/spreadsheetService';
import { useToast } from '@/hooks/useToast';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDebouncedCallback } from 'use-debounce';
import { Loader2 } from 'lucide-react';
import { ChartConfig } from '@/types/chart';
import { ToastProvider } from '@/components/ui/toast';
// Fix: Import the spreadsheetFunctions correctly
import { spreadsheetFunctions } from '@/lib/spreadsheet-functions';

const DEFAULT_SHEET: Sheet = {
  id: '1',
  name: 'Sheet 1',
  isActive: true,
  cells: {},
  rowCount: 100,
  columnCount: 26,
  frozen: {
    rows: 0,
    columns: 0
  }
};

const DEFAULT_SELECTION: SelectionState = {
  start: '',
  end: '',
  sheetId: '1'
};

function SpreadsheetPage() {
  const router = useRouter();
  const { id: spreadsheetId } = router.query;
  const { showToast } = useToast();

  // State hooks
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>({
    id: '',
    name: '',
    rowCount: 100,
    columnCount: 26,
    cells: {},
    charts: [],
    frozen: {
      rows: 0,
      columns: 0
    },
    sheets: [DEFAULT_SHEET],
    activeSheetId: DEFAULT_SHEET.id
  });
  const [selection, setSelection] = useState<SelectionState>(DEFAULT_SELECTION);
  const [currentFormat, setCurrentFormat] = useState<CellFormat>({
    bold: false,
    italic: false,
    underline: false,
    textAlign: 'left',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    fontSize: 11,
    fontFamily: 'Arial',
    color: '#000000'
  });
  const [isChartDialogOpen, setIsChartDialogOpen] = useState(false);

  // Get active sheet
  const activeSheet = spreadsheetData?.sheets?.find(s => s.id === spreadsheetData?.activeSheetId) || DEFAULT_SHEET;

  // Debounced save
  const debouncedSave = useDebouncedCallback(async (data: SpreadsheetData) => {
    if (!spreadsheetId || isSaving) return;
    
    setIsSaving(true);
    try {
      await spreadsheetService.updateSpreadsheet(spreadsheetId as string, data);
    } catch (error) {
      console.error('Failed to save spreadsheet:', error);
      showToast({
        variant: 'error',
        title: 'Failed to save changes'
      });
    } finally {
      setIsSaving(false);
    }
  }, 1000);

  // Function to evaluate formulas in the spreadsheet
  const evaluateFormulas = useCallback((sheet: Sheet): Sheet => {
    // Create a copy of sheet to avoid direct mutation
    const updatedSheet = { ...sheet };
    const updatedCells = { ...sheet.cells };
    
    // Process all cells to evaluate formulas
    Object.keys(updatedCells).forEach(cellId => {
      const cell = updatedCells[cellId];
      if (cell?.value && typeof cell.value === 'string' && cell.value.startsWith('=')) {
        try {
          const result = spreadsheetFunctions.evaluateFormula(cell.value, updatedCells);
          // Update calculated value but preserve the formula
          updatedCells[cellId] = {
            ...cell,
            calculatedValue: result.toString()
          };
        } catch (error) {
          console.error(`Error evaluating formula in cell ${cellId}:`, error);
          updatedCells[cellId] = {
            ...cell,
            calculatedValue: '#ERROR!'
          };
        }
      }
    });
    
    updatedSheet.cells = updatedCells;
    return updatedSheet;
  }, []);

  // Fix for the first error: Safely handle undefined sheets array in handleCellFormatChange
  const handleCellFormatChange = useCallback(async (cellRef: string, format: Partial<CellFormat>) => {
    try {
      if (!cellRef) return;

      // Safety check: Make sure sheets array exists and activeSheetId is valid
      if (!spreadsheetData.sheets || spreadsheetData.sheets.length === 0) {
        console.error("No sheets available in spreadsheet data");
        return;
      }

      // Get the current sheet with a safety check
      const sheet = spreadsheetData.sheets.find(s => s.id === spreadsheetData.activeSheetId);
      if (!sheet) {
        console.error(`Active sheet with ID ${spreadsheetData.activeSheetId} not found`);
        return;
      }

      // Create updated cells object with new format
      const updatedCells = { ...sheet.cells };
      
      // If there's a range selection, update all cells in the range
      if (selection.end && selection.end !== selection.start) {
        const match = selection.start.match(/([A-Z]+)(\d+)/);
        if (!match) throw new Error('Invalid cell reference');
        const [startCol, startRow] = match.slice(1);
        const endMatch = selection.end.match(/([A-Z]+)(\d+)/);
        if (!endMatch) throw new Error('Invalid end cell reference');
        const [endCol, endRow] = endMatch.slice(1);
        
        const startColNum = startCol.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);
        const endColNum = endCol.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);
        
        for (let col = Math.min(startColNum, endColNum); col <= Math.max(startColNum, endColNum); col++) {
          for (let row = Math.min(parseInt(startRow), parseInt(endRow)); row <= Math.max(parseInt(startRow), parseInt(endRow)); row++) {
            const cellRef = `${String.fromCharCode(64 + col)}${row}`;
            updatedCells[cellRef] = {
              ...updatedCells[cellRef],
              format: {
                ...(updatedCells[cellRef]?.format || {}),
                ...format
              }
            };
          }
        }
      } else {
        // Single cell update
        updatedCells[selection.start] = {
          ...updatedCells[selection.start],
          format: {
            ...(updatedCells[selection.start]?.format || {}),
            ...format
          }
        };
      }

      // Create updated sheet and spreadsheet data
      const updatedSheet = {
        ...sheet,
        cells: updatedCells
      };

      const updatedData = {
        ...spreadsheetData,
        sheets: spreadsheetData.sheets.map(s =>
          s.id === sheet.id ? updatedSheet : s
        )
      };

      // Update state and save changes
      setSpreadsheetData(updatedData);
      setCurrentFormat(prev => ({ ...prev, ...format }));
      await debouncedSave(updatedData);
    } catch (error) {
      console.error('Failed to update cell format:', error);
      showToast({
        variant: 'error',
        title: 'Failed to update cell format'
      });
    }
  }, [spreadsheetData, selection, debouncedSave, showToast]);

  // Enhanced handleCellChange function with formula evaluation
  const handleCellChange = useCallback((cellRef: string, value: string) => {
    try {
      if (!cellRef) return;

      // Safety check for sheets
      if (!spreadsheetData.sheets || spreadsheetData.sheets.length === 0) {
        console.error("No sheets available in spreadsheet data");
        return;
      }

      // Get the current sheet with a safety check
      const sheet = spreadsheetData.sheets.find(s => s.id === spreadsheetData.activeSheetId);
      if (!sheet) {
        console.error(`Active sheet with ID ${spreadsheetData.activeSheetId} not found`);
        return;
      }

      // Create updated cells object with new value
      const updatedCells = { ...sheet.cells };
      
      // Update the cell with the new value
      updatedCells[cellRef] = {
        ...updatedCells[cellRef],
        value
      };

      // Check if this is a formula and evaluate it
      if (value.startsWith('=')) {
        try {
          const result = spreadsheetFunctions.evaluateFormula(value, updatedCells);
          updatedCells[cellRef].calculatedValue = result.toString();
        } catch (error) {
          console.error(`Error evaluating formula:`, error);
          updatedCells[cellRef].calculatedValue = '#ERROR!';
        }
      } else {
        // If not a formula, remove any previously calculated value
        if (updatedCells[cellRef].calculatedValue) {
          delete updatedCells[cellRef].calculatedValue;
        }
      }

      // Create updated sheet
      const updatedSheet = {
        ...sheet,
        cells: updatedCells
      };

      // Re-evaluate all formulas in the sheet as they might reference this cell
      const reevaluatedSheet = evaluateFormulas(updatedSheet);

      // Create updated spreadsheet data
      const updatedData = {
        ...spreadsheetData,
        sheets: spreadsheetData.sheets.map(s =>
          s.id === sheet.id ? reevaluatedSheet : s
        )
      };

      // Update state and save changes
      setSpreadsheetData(updatedData);
      debouncedSave(updatedData);
    } catch (error) {
      console.error('Failed to update cell value:', error);
      showToast({
        variant: 'error',
        title: 'Failed to update cell value'
      });
    }
  }, [spreadsheetData, debouncedSave, showToast, evaluateFormulas]);

  // Handle selection change
  const handleSelectionChange = useCallback((newSelection: SelectionState) => {
    setSelection(newSelection);
    // Safety check for accessing cell format when changing selection
    if (newSelection.start && activeSheet && activeSheet.cells) {
      const cellFormat = activeSheet.cells[newSelection.start]?.format || {};
      setCurrentFormat(prev => ({ ...prev, ...cellFormat }));
    }
  }, [activeSheet]);

  // Handle sheet change
  const handleSheetChange = useCallback((sheetId: string) => {
    setSpreadsheetData(prev => ({
      ...prev,
      activeSheetId: sheetId,
      sheets: prev.sheets.map(sheet => ({
        ...sheet,
        isActive: sheet.id === sheetId
      }))
    }));
    setSelection({ ...DEFAULT_SELECTION, sheetId });
  }, []);

  // Handle add sheet
  const handleAddSheet = useCallback(() => {
    const newSheetId = `sheet-${Date.now()}`;
    const currentSheets = spreadsheetData?.sheets || [];
    
    const newSheet: Sheet = {
      id: newSheetId,
      name: `Sheet ${currentSheets.length + 1}`,
      isActive: true,
      cells: {},
      rowCount: 100,
      columnCount: 26,
      frozen: { rows: 0, columns: 0 }
    };
  
    setSpreadsheetData(prev => ({
      ...prev,
      activeSheetId: newSheetId,
      sheets: [...(prev.sheets || []).map(sheet => ({
        ...sheet,
        isActive: false
      })), newSheet]
    }));
  
    setSelection({ ...DEFAULT_SELECTION, sheetId: newSheetId });
  }, [spreadsheetData]);

  // Handle add row
  const handleAddRow = useCallback(async () => {
    try {
      if (!activeSheet) return;

      const updatedSheet = {
        ...activeSheet,
        rowCount: activeSheet.rowCount + 1
      };

      const updatedData = {
        ...spreadsheetData,
        sheets: spreadsheetData.sheets.map(sheet =>
          sheet.id === activeSheet.id ? updatedSheet : sheet
        )
      };

      setSpreadsheetData(updatedData);
      debouncedSave(updatedData);
    } catch (error) {
      console.error('Failed to add row:', error);
      showToast({
        variant: 'error',
        title: 'Failed to add row'
      });
    }
  }, [activeSheet, spreadsheetData, debouncedSave, showToast]);

  // Handle delete row
  const handleDeleteRow = useCallback(async () => {
    try {
      if (!activeSheet || activeSheet.rowCount <= 1) return; // Prevent deleting last row

      const updatedSheet = {
        ...activeSheet,
        rowCount: activeSheet.rowCount - 1,
        cells: Object.fromEntries(
          Object.entries(activeSheet.cells).filter(([cellRef]) => {
            const row = parseInt(cellRef.match(/\d+/)?.[0] || "0");
            return row <= activeSheet.rowCount - 1;
          })
        )
      };

      // Re-evaluate formulas after deleting row
      const reevaluatedSheet = evaluateFormulas(updatedSheet);

      const updatedData = {
        ...spreadsheetData,
        sheets: spreadsheetData.sheets.map(sheet =>
          sheet.id === activeSheet.id ? reevaluatedSheet : sheet
        )
      };

      setSpreadsheetData(updatedData);
      debouncedSave(updatedData);
    } catch (error) {
      console.error('Failed to delete row:', error);
      showToast({
        variant: 'error',
        title: 'Failed to delete row'
      });
    }
  }, [activeSheet, spreadsheetData, debouncedSave, showToast, evaluateFormulas]);

  // Handle add column
  const handleAddColumn = useCallback(async () => {
    try {
      if (!activeSheet) return;

      const updatedSheet = {
        ...activeSheet,
        columnCount: activeSheet.columnCount + 1
      };

      const updatedData = {
        ...spreadsheetData,
        sheets: spreadsheetData.sheets.map(sheet =>
          sheet.id === activeSheet.id ? updatedSheet : sheet
        )
      };

      setSpreadsheetData(updatedData);
      debouncedSave(updatedData);
    } catch (error) {
      console.error('Failed to add column:', error);
      showToast({
        variant: 'error',
        title: 'Failed to add column'
      });
    }
  }, [activeSheet, spreadsheetData, debouncedSave, showToast]);

  // Handle delete column
  const handleDeleteColumn = useCallback(async () => {
    try {
      if (!activeSheet || activeSheet.columnCount <= 1) return; // Prevent deleting last column

      const updatedSheet = {
        ...activeSheet,
        columnCount: activeSheet.columnCount - 1,
        cells: Object.fromEntries(
          Object.entries(activeSheet.cells).filter(([cellRef]) => {
            const col = cellRef.match(/[A-Z]+/)?.[0] || "";
            return col.length === 1 && col.charCodeAt(0) - 65 < activeSheet.columnCount - 1;
          })
        )
      };

      // Re-evaluate formulas after deleting column
      const reevaluatedSheet = evaluateFormulas(updatedSheet);

      const updatedData = {
        ...spreadsheetData,
        sheets: spreadsheetData.sheets.map(sheet =>
          sheet.id === activeSheet.id ? reevaluatedSheet : sheet
        )
      };

      setSpreadsheetData(updatedData);
      debouncedSave(updatedData);
    } catch (error) {
      console.error('Failed to delete column:', error);
      showToast({
        variant: 'error',
        title: 'Failed to delete column'
      });
    }
  }, [activeSheet, spreadsheetData, debouncedSave, showToast, evaluateFormulas]);

  // Handle create chart
  const handleCreateChart = useCallback((config: ChartConfig) => {
    try {
      if (!activeSheet) return;
      
      const updatedData = {
        ...spreadsheetData,
        charts: [...(spreadsheetData.charts || []), {
          ...config,
          id: config.id || `chart-${Date.now()}`,
          sheetId: activeSheet.id
        }]
      };

      setSpreadsheetData(updatedData);
      debouncedSave(updatedData);
      setIsChartDialogOpen(false);
      
      showToast({
        variant: 'success',
        title: 'Chart created successfully'
      });
    } catch (error) {
      console.error('Failed to create chart:', error);
      showToast({
        variant: 'error',
        title: 'Failed to create chart'
      });
    }
  }, [activeSheet, spreadsheetData, debouncedSave, showToast]);

  // useEffect hook for loading sheet data
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadSpreadsheet = async () => {
      if (!spreadsheetId) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await spreadsheetService.getSpreadsheet(spreadsheetId as string);
        
        if (isMounted) {
          // Process data to evaluate formulas on load
          if (data.sheets && data.sheets.length > 0) {
            const processedSheets = data.sheets.map(sheet => evaluateFormulas(sheet));
            data.sheets = processedSheets;
          }
          
          setSpreadsheetData(data);
          if (data.activeSheetId) {
            setSelection({ ...DEFAULT_SELECTION, sheetId: data.activeSheetId });
          }
        }
      } catch (error) {
        console.error('Failed to load spreadsheet:', error);
        if (isMounted) {
          setError('Failed to load spreadsheet');
          showToast({
            variant: 'error',
            title: 'Failed to load spreadsheet'
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSpreadsheet();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [spreadsheetId, showToast, evaluateFormulas]);

  // Hotkeys
  useHotkeys('ctrl+b', () => {
    if (selection.start) {
      handleCellFormatChange(selection.start, { bold: !currentFormat.bold });
    }
  });

  useHotkeys('ctrl+i', () => {
    if (selection.start) {
      handleCellFormatChange(selection.start, { italic: !currentFormat.italic });
    }
  });

  useHotkeys('ctrl+u', () => {
    if (selection.start) {
      handleCellFormatChange(selection.start, { underline: !currentFormat.underline });
    }
  });

  // Render loading and error states
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => router.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Main render
  return (
    <div className="h-screen flex flex-col bg-white">
      {spreadsheetData && (
        <>
          <Menu
            spreadsheetId={spreadsheetId as string}
            spreadsheetData={spreadsheetData}
            onDataChange={setSpreadsheetData}
            selectedRange={selection.end ? `${selection.start}:${selection.end}` : selection.start}
          />
          
          <Toolbar
            onFormatChange={(format) => handleCellFormatChange(selection.start, format)}
            onAddRow={handleAddRow}
            onDeleteRow={handleDeleteRow}
            onAddColumn={handleAddColumn}
            onDeleteColumn={handleDeleteColumn}
            currentFormat={currentFormat}
            selection={selection}
            spreadsheetId={spreadsheetId as string}
            selectedRange={selection.end ? `${selection.start}:${selection.end}` : selection.start}
          />
          
          <FormulaBar
            value={selection.start ? activeSheet.cells[selection.start]?.value || '' : ''}
            onChange={(value) => {
              if (selection.start) {
                handleCellChange(selection.start, value);
              }
            }}
            selectedCell={selection.start}
          />
          
          <div className="flex-1 relative overflow-hidden border-t border-gray-200">
            <Grid
              key={`${activeSheet.id}-${activeSheet.rowCount}-${activeSheet.columnCount}`}
              sheet={activeSheet}
              selection={selection}
              onSelectionChange={handleSelectionChange}
              onCellChange={handleCellChange}
              currentFormat={currentFormat}
              onCellFormatChange={handleCellFormatChange}
            />
          </div>

          <SheetTabs
            sheets={spreadsheetData.sheets || []}
            activeSheet={spreadsheetData.activeSheetId || '1'}
            onSheetChange={handleSheetChange}
            onAddSheet={handleAddSheet}
            onSheetSelect={(sheetId) => handleSheetChange(sheetId)}
            onRenameSheet={() => {}}
            onDeleteSheet={() => {}}
          />

          <ChartDialog
            isOpen={isChartDialogOpen}
            onClose={() => setIsChartDialogOpen(false)}
            onCreateChart={handleCreateChart}
            sheet={activeSheet}
            selection={selection}
            selectedRange={selection.end ? `${selection.start}:${selection.end}` : selection.start}
            data={spreadsheetData}
          />
        </>
      )}
    </div>
  );
}

export default function SpreadsheetPageWrapper() {
  // Wrap the component with ToastProvider to fix the second error
  return (
    <ToastProvider>
      <ErrorBoundary>
        <SpreadsheetPage />
      </ErrorBoundary>
    </ToastProvider>
  );
}