// src/hooks/useUndo.ts

import { useState, useCallback } from 'react';
import { SpreadsheetData } from '@/types/spreadsheet';

interface HistoryState {
  past: SpreadsheetData[];
  present: SpreadsheetData;
  future: SpreadsheetData[];
}

export function useUndo(initialPresent: SpreadsheetData) {
  const [state, setState] = useState<HistoryState>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    setState((currentState) => {
      if (!currentState.past.length) return currentState;

      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((currentState) => {
      if (!currentState.future.length) return currentState;

      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const recordChange = useCallback((newPresent: SpreadsheetData) => {
    setState((currentState) => ({
      past: [...currentState.past, currentState.present],
      present: newPresent,
      future: [],
    }));
  }, []);

  return {
    state: state.present,
    canUndo,
    canRedo,
    undo,
    redo,
    recordChange,
  };
}