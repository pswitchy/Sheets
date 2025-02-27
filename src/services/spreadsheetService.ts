// src/services/spreadsheetService.ts
// Last Updated: 2025-02-26 18:35:03
// Author: parthsharma-git

import axios from 'axios';
import { SpreadsheetData, CellFormat } from '@/types/spreadsheet';

const BASE_URL = '/api/spreadsheets';

export const spreadsheetService = {
  async createSpreadsheet() {
    const response = await axios.post(BASE_URL);
    return response.data;
  },

  async getSpreadsheet(id: string, retryCount = 3): Promise<SpreadsheetData> {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.getSpreadsheet(id, retryCount - 1);
      }
      throw error;
    }
  },

  async updateSpreadsheet(id: string, data: Partial<SpreadsheetData>) {
    const response = await axios.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async updateCell(id: string, cellRef: string, value: string) {
    const response = await axios.patch(`${BASE_URL}/${id}/cells/${cellRef}`, { value });
    return response.data;
  },

  async updateCellFormat(id: string, cellRef: string, format: Partial<CellFormat>) {
    const response = await axios.patch(`${BASE_URL}/${id}/cells/${cellRef}/format`, format);
    return response.data;
  },

  async importSpreadsheet(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${BASE_URL}/${id}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async cutCells(id: string, range: string) {
    const response = await axios.post(`${BASE_URL}/${id}/cut`, { range });
    return response.data;
  },

  async copyCells(id: string, range: string) {
    const response = await axios.post(`${BASE_URL}/${id}/copy`, { range });
    return response.data;
  },

  async pasteCells(id: string, targetCell: string) {
    const response = await axios.post(`${BASE_URL}/${id}/paste`, { targetCell });
    return response.data;
  },

  async clearFormats(id: string, range: string) {
    const response = await axios.post(`${BASE_URL}/${id}/clear-formats`, { range });
    return response.data;
  },

  async toggleFreeze(id: string, type: 'row' | 'column') {
    const response = await axios.post(`${BASE_URL}/${id}/toggle-freeze`, { type });
    return response.data;
  },
};