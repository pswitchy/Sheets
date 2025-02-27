// src/pages/api/export/[id].ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { database } from '@/lib/database';
import { exportUtils } from '@/lib/export-utils';
import { SpreadsheetData } from '@/types/spreadsheet';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { id } = req.query;
  const { format } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: "Invalid ID" });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const spreadsheet = await database.getSpreadsheet(id);
    if (!spreadsheet) {
      return res.status(404).json({ message: "Spreadsheet not found" });
    }

    switch (format) {
      case 'xlsx':
        const workbookBuffer = await exportUtils.toExcel(spreadsheet.data as SpreadsheetData, spreadsheet.name);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${spreadsheet.name}.xlsx"`);
        return res.status(200).send(workbookBuffer);

      case 'csv':
        const csvContent = await exportUtils.toCsv(spreadsheet.data, spreadsheet.name);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${spreadsheet.name}.csv"`);
        return res.status(200).send(csvContent);

      default:
        return res.status(400).json({ message: "Invalid export format" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error exporting spreadsheet" });
  }
}