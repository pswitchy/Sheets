// src/lib/database.ts

import { PrismaClient } from '@prisma/client';
import { SpreadsheetData } from '@/types/spreadsheet';

const prisma = new PrismaClient();

export const database = {
  createSpreadsheet: async (userId: string, name: string, data: SpreadsheetData) => {
    return await prisma.spreadsheet.create({
      data: {
        name,
        data: data as any,
        userId,
      },
    });
  },

  updateSpreadsheet: async (id: string, data: SpreadsheetData) => {
    return await prisma.spreadsheet.update({
      where: { id },
      data: {
        data: data as any,
        updatedAt: new Date(),
      },
    });
  },

  getSpreadsheet: async (id: string) => {
    return await prisma.spreadsheet.findUnique({
      where: { id },
    });
  },

  getUserSpreadsheets: async (userId: string) => {
    return await prisma.spreadsheet.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  },

  deleteSpreadsheet: async (id: string) => {
    return await prisma.spreadsheet.delete({
      where: { id },
    });
  },
};