// src/hooks/useAutosave.ts

import { useEffect, useRef } from 'react';
import { SpreadsheetData } from '@/types/spreadsheet';

export function useAutosave(
  data: SpreadsheetData,
  saveCallback: (data: SpreadsheetData) => Promise<void>,
  delay: number = 2000
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSavedRef = useRef<string>(JSON.stringify(data));

  useEffect(() => {
    const currentData = JSON.stringify(data);
    if (currentData === lastSavedRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        await saveCallback(data);
        lastSavedRef.current = currentData;
      } catch (error) {
        console.error('Autosave failed:', error);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveCallback, delay]);
}