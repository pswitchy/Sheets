// src/components/Spreadsheet/Menu.tsx

import React from 'react';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
} from '@/components/ui/menubar';
import { exportUtils } from '@/lib/export-utils';
import { SpreadsheetData } from '@/types/spreadsheet';
import { downloadFile } from '@/lib/file-utils';
import { spreadsheetService } from '@/services/spreadsheetService';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

interface MenuProps {
  spreadsheetId: string;
  spreadsheetData: SpreadsheetData;
  onDataChange: (data: SpreadsheetData) => void;
  // Let the parent component handle these actions
  selectedRange: string;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
}

export const Menu: React.FC<MenuProps> = ({
  spreadsheetId,
  spreadsheetData,
  onDataChange,
  selectedRange,
  onCut,
  onCopy,
  onPaste,
}) => {
  const router = useRouter();

  const handleNew = async () => {
    try {
      const newSpreadsheet = await spreadsheetService.createSpreadsheet();
      if (newSpreadsheet?.data?.id) {
        toast.success('New spreadsheet created');
        router.push(`/spreadsheet/${newSpreadsheet.data.id}`);
      } else {
        throw new Error("Failed to get ID for new spreadsheet");
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to create new spreadsheet.');
    }
  };

  const handleSave = async () => {
    try {
      await spreadsheetService.updateSpreadsheet(spreadsheetId, spreadsheetData);
      toast.success('Spreadsheet saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save spreadsheet.');
    }
  };

  const handleExport = async (format: 'xlsx' | 'csv') => {
    const toastId = toast.loading(`Exporting as ${format.toUpperCase()}...`);
    try {
      const filename = spreadsheetData.name || 'spreadsheet';
      let data: Blob;
      let fileExt = format;

      if (format === 'xlsx') {
        data = await exportUtils.toExcel(spreadsheetData, `${filename}.${fileExt}`);
      } else {
        data = await exportUtils.toCsv(spreadsheetData, `${filename}.${fileExt}`);
      }
      downloadFile(data, `${filename}.${fileExt}`);
      toast.success(`Spreadsheet exported as`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to export spreadsheet.', { id: toastId });
    }
  };

  const handleImport = async (file: File) => {
    const toastId = toast.loading('Importing file...');
    try {
      const data = await spreadsheetService.importSpreadsheet(spreadsheetId, file);
      onDataChange(data);
      toast.success('File imported successfully', {id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to import file.', { id: toastId });
    }
  };

  return (
    <Menubar className="border-b px-2 bg-white rounded-none h-9">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={handleNew}>
            New <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={handleSave}>
            Save <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
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
          <MenubarItem onClick={() => handleExport('xlsx')}>Export as Excel</MenubarItem>
          <MenubarItem onClick={() => handleExport('csv')}>Export as CSV</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onCut}>Cut<MenubarShortcut>⌘X</MenubarShortcut></MenubarItem>
          <MenubarItem onClick={onCopy}>Copy<MenubarShortcut>⌘C</MenubarShortcut></MenubarItem>
          <MenubarItem onClick={onPaste}>Paste<MenubarShortcut>⌘V</MenubarShortcut></MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Freeze First Row</MenubarItem>
          <MenubarItem>Freeze First Column</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

export default Menu;