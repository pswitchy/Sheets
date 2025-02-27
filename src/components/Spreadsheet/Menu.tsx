// src/components/Spreadsheet/Menu.tsx
// Last Updated: 2025-02-26 18:35:03
// Author: parthsharma-git

import React, { useCallback, useState } from 'react';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
} from '@/components/ui/menubar';
import { useHotkeys } from 'react-hotkeys-hook';
import { exportUtils } from '@/lib/export-utils';
import { SpreadsheetData } from '@/types/spreadsheet';
import { downloadFile } from '@/lib/file-utils';
import { Toast } from '@/components/ui/toast';
import { spreadsheetService } from '@/services/spreadsheetService';

interface MenuProps {
  spreadsheetId: string;
  spreadsheetData: SpreadsheetData;
  onDataChange: (data: SpreadsheetData) => void;
  selectedRange: string;
}

export const Menu: React.FC<MenuProps> = ({
  spreadsheetId,
  spreadsheetData,
  onDataChange,
  selectedRange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOperation = async (operation: () => Promise<void>, errorMessage: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await operation();
    } catch (error) {
      console.error(error);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNew = useCallback(() => {
    handleOperation(async () => {
      const newSpreadsheet = await spreadsheetService.createSpreadsheet();
      window.location.href = `/spreadsheet/${newSpreadsheet.id}`;
    }, 'Failed to create new spreadsheet');
  }, []);

  const handleSave = useCallback(() => {
    handleOperation(async () => {
      await spreadsheetService.updateSpreadsheet(spreadsheetId, spreadsheetData);
      showToast('Spreadsheet saved successfully', 'success');
    }, 'Failed to save spreadsheet');
  }, [spreadsheetId, spreadsheetData]);

  const handleExport = useCallback(async (format: 'xlsx' | 'csv') => {
    handleOperation(async () => {
      let data: Blob;
      let filename: string;

      switch (format) {
        case 'xlsx':
          filename = `spreadsheet-${Date.now()}.xlsx`;
          data = await exportUtils.toExcel(spreadsheetData, filename);
          break;
        case 'csv':
          filename = `spreadsheet-${Date.now()}.csv`;
          data = await exportUtils.toCsv(spreadsheetData, filename);
          break;
        default:
          throw new Error('Unsupported format');
      }

      downloadFile(data, filename);
    }, `Failed to export as ${format.toUpperCase()}`);
  }, [spreadsheetData]);

  const handleImport = useCallback(async (file: File) => {
    handleOperation(async () => {
      const data = await spreadsheetService.importSpreadsheet(spreadsheetId, file);
      onDataChange(data);
      showToast('File imported successfully', 'success');
    }, 'Failed to import file');
  }, [spreadsheetId, onDataChange]);

  const handleCut = useCallback(() => {
    handleOperation(async () => {
      if (!selectedRange) return;
      const data = await spreadsheetService.cutCells(spreadsheetId, selectedRange);
      onDataChange(data);
    }, 'Failed to cut cells');
  }, [spreadsheetId, selectedRange, onDataChange]);

  const handleCopy = useCallback(() => {
    handleOperation(async () => {
      if (!selectedRange) return;
      await spreadsheetService.copyCells(spreadsheetId, selectedRange);
    }, 'Failed to copy cells');
  }, [spreadsheetId, selectedRange]);

  const handlePaste = useCallback(() => {
    handleOperation(async () => {
      if (!selectedRange) return;
      const data = await spreadsheetService.pasteCells(spreadsheetId, selectedRange);
      onDataChange(data);
    }, 'Failed to paste cells');
  }, [spreadsheetId, selectedRange, onDataChange]);

  // Keyboard shortcuts
  useHotkeys('ctrl+s', handleSave, [handleSave]);
  useHotkeys('ctrl+n', handleNew, [handleNew]);
  useHotkeys('ctrl+x', handleCut, [handleCut]);
  useHotkeys('ctrl+c', handleCopy, [handleCopy]);
  useHotkeys('ctrl+v', handlePaste, [handlePaste]);

  return (
    <>
      <Menubar className="border-b px-2 bg-white">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={handleNew} disabled={isLoading}>
              New
              <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleSave} disabled={isLoading}>
              Save
              <MenubarShortcut>⌘S</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled={isLoading}>
              <label className="flex items-center w-full cursor-pointer">
                Import
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImport(file);
                  }}
                />
              </label>
            </MenubarItem>
            <MenubarItem onClick={() => handleExport('xlsx')} disabled={isLoading}>
              Export as Excel
            </MenubarItem>
            <MenubarItem onClick={() => handleExport('csv')} disabled={isLoading}>
              Export as CSV
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={handleCut} disabled={isLoading || !selectedRange}>
              Cut
              <MenubarShortcut>⌘X</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleCopy} disabled={isLoading || !selectedRange}>
              Copy
              <MenubarShortcut>⌘C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handlePaste} disabled={isLoading}>
              Paste
              <MenubarShortcut>⌘V</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => handleOperation(async () => {
              const data = await spreadsheetService.clearFormats(spreadsheetId, selectedRange);
              onDataChange(data);
            }, 'Failed to clear formats')} disabled={isLoading || !selectedRange}>
              Clear Formatting
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => handleOperation(async () => {
              const data = await spreadsheetService.toggleFreeze(spreadsheetId, 'row');
              onDataChange(data);
            }, 'Failed to toggle freeze')} disabled={isLoading}>
              Freeze First Row
            </MenubarItem>
            <MenubarItem onClick={() => handleOperation(async () => {
              const data = await spreadsheetService.toggleFreeze(spreadsheetId, 'column');
              onDataChange(data);
            }, 'Failed to toggle freeze')} disabled={isLoading}>
              Freeze First Column
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => window.open('/docs', '_blank')}>
              Documentation
            </MenubarItem>
            <MenubarItem onClick={() => window.open('/shortcuts', '_blank')}>
              Keyboard Shortcuts
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {toast && (
        <Toast
          variant={toast.type}
          title={toast.message}
          className="fixed bottom-4 right-4"
        />
      )}
    </>
  );
};

export default Menu;