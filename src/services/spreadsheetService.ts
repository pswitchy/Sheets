// src/services/spreadsheetService.ts

import axios from 'axios';
import { SpreadsheetData } from '@/types/spreadsheet';
import { ApiResponse } from '@/lib/api-middleware'; // Assuming you create this type
import { SpreadsheetListItem } from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const spreadsheetService = {
  async createSpreadsheet(): Promise<ApiResponse<{ id: string }>> {
    const response = await api.post('/spreadsheets');
    return response.data;
  },

  async getSpreadsheet(id: string): Promise<SpreadsheetData> {
    const response = await api.get(`/spreadsheets/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch spreadsheet');
  },

  async getUserSpreadsheets(): Promise<ApiResponse<SpreadsheetListItem[]>> {
    const response = await api.get('/spreadsheets');
    return response.data;
  },

  async updateSpreadsheet(id: string, data: Partial<SpreadsheetData>): Promise<ApiResponse> {
    const response = await api.put(`/spreadsheets/${id}`, data);
    return response.data;
  },
  
  async importSpreadsheet(id: string, file: File): Promise<SpreadsheetData> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/spreadsheets/${id}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
     if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to import file');
  },
  
  // Other methods like cut, copy, paste can be added here
  // e.g., async copyCells(id: string, range: string) { ... }
};