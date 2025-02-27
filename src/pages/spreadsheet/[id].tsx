// src/pages/spreadsheet/[id].tsx
// Last Updated: 2025-02-26 21:13:53
// Author: parthsharma-git

import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useRouter } from 'next/router';
import { Menu } from '@/components/Spreadsheet/Menu';
import { Toolbar } from '@/components/Spreadsheet/Toolbar';
import { Grid } from '@/components/Spreadsheet/Grid';
import FormulaBar from '@/components/Spreadsheet/FormulaBar';
import { ChartDialog } from '@/components/Spreadsheet/ChartDialog';
import { SheetTabs } from '@/components/Spreadsheet/SheetTabs';
import { SpreadsheetData, CellFormat, SelectionState, Sheet } from '@/types/spreadsheet';
import { spreadsheetService } from '@/services/spreadsheetService';
import { useToast } from '@/hooks/useToast';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDebouncedCallback } from 'use-debounce';
import { Loader2 } from 'lucide-react';
import { ChartConfig } from '@/types/chart';

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

  // All useCallback hooks
  const handleCellChange = useCallback(async (cellRef: string, value: string) => {
    try {
      if (!spreadsheetData?.sheets?.length) {
        console.error('No sheets array in spreadsheet data');
        setSpreadsheetData(prev => ({
          ...prev,
          sheets: [DEFAULT_SHEET]
        }));
        return;
      }

      const sheet = spreadsheetData.sheets.find(s => s.id === spreadsheetData.activeSheetId);
      if (!sheet) {
        console.error('Active sheet not found');
        return;
      }

      const updatedSheet = {
        ...sheet,
        cells: {
          ...sheet.cells,
          [cellRef]: {
            ...sheet.cells?.[cellRef],
            value
          }
        }
      };

      const updatedData = {
        ...spreadsheetData,
        sheets: spreadsheetData.sheets.map(s =>
          s.id === sheet.id ? updatedSheet : s
        )
      };

      setSpreadsheetData(updatedData);
      await debouncedSave(updatedData);
    } catch (error) {
      console.error('Failed to update cell:', error);
      showToast({
        variant: 'error',
        title: 'Failed to update cell',
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, [activeSheet, spreadsheetData, debouncedSave, showToast]);

  const handleCellFormatChange = useCallback(async (cellRef: string, format: Partial<CellFormat>) => {
    try {
      const updatedSheet = {
        ...activeSheet,
        cells: {
          ...activeSheet.cells,
          [cellRef]: {
            ...activeSheet.cells[cellRef],
            format: {
              ...activeSheet.cells[cellRef]?.format,
              ...format
            }
          }
        }
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
      console.error('Failed to update cell format:', error);
      showToast({
        variant: 'error',
        title: 'Failed to update cell format'
      });
    }
  }, [activeSheet, spreadsheetData, debouncedSave, showToast]);

  const handleSelectionChange = useCallback((newSelection: SelectionState) => {
    setSelection(newSelection);
    const cellFormat = activeSheet.cells[newSelection.start]?.format || {};
    setCurrentFormat(prev => ({ ...prev, ...cellFormat }));
  }, [activeSheet]);

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

  const handleAddRow = useCallback(async () => {
    try {
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

  const handleDeleteRow = useCallback(async () => {
    try {
        if (activeSheet.rowCount <= 1) return; // Prevent deleting last row
        
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

        const updatedData = {
            ...spreadsheetData,
            sheets: spreadsheetData.sheets.map(sheet =>
                sheet.id === activeSheet.id ? updatedSheet : sheet
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
}, [activeSheet, spreadsheetData, debouncedSave, showToast]);

const handleAddColumn = useCallback(async () => {
    try {
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

const handleDeleteColumn = useCallback(async () => {
    try {
        if (activeSheet.columnCount <= 1) return; // Prevent deleting last column
        
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

        const updatedData = {
            ...spreadsheetData,
            sheets: spreadsheetData.sheets.map(sheet =>
                sheet.id === activeSheet.id ? updatedSheet : sheet
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
}, [activeSheet, spreadsheetData, debouncedSave, showToast]);

  const handleCreateChart = useCallback((config: ChartConfig) => {
    try {
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
}, [activeSheet.id, spreadsheetData, debouncedSave, showToast]);

  // useEffect hook
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
  }, [spreadsheetId, showToast]);

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
            selectedRange={''}
          />
          
          <Toolbar
            onFormatChange={(format) => {
              if (selection.start) {
                handleCellFormatChange(selection.start, format);
              }
            }}
            onAddRow={handleAddRow}
            onDeleteRow={() => {}}
            onAddColumn={() => {}}
            onDeleteColumn={() => {}}
            currentFormat={currentFormat}
            selection={selection}
            spreadsheetId={spreadsheetId as string}
            selectedRange={''}
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
              onCellFormatChange={function (cellRef: string, format: Partial<CellFormat>): void {
                throw new Error('Function not implemented.');
              }}
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
            selectedRange={''}
            data={spreadsheetData}
          />
        </>
      )}
    </div>
  );
}


export default function SpreadsheetPageWrapper() {
    return (
      <ErrorBoundary>
        <SpreadsheetPage />
      </ErrorBoundary>
    );
  }
