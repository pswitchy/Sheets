// src/pages/api/export/[id].ts

import { NextApiResponse } from 'next';
import { database } from '@/lib/database';
import { exportUtils } from '@/lib/export-utils';
import { SpreadsheetData } from '@/types/spreadsheet';
import { apiHandler, AuthenticatedNextApiRequest } from '@/lib/api-middleware';

// Note: This handler doesn't use the standard JSON response, so we don't type the response with ApiResponse
async function handler(
  req: AuthenticatedNextApiRequest,
  res: NextApiResponse 
) {
  const { id, format } = req.query;

  if (typeof id !== 'string') {
    res.status(400).json({ message: "Invalid Spreadsheet ID" });
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // Permission check: a more robust system would check shares here as well
    const spreadsheet = await database.getSpreadsheet(id);
    if (!spreadsheet || spreadsheet.userId !== req.user.id) {
      res.status(404).json({ message: "Spreadsheet not found or permission denied" });
      return;
    }

    const spreadsheetData = spreadsheet.data as unknown as SpreadsheetData;
    const filename = spreadsheet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (format === 'xlsx') {
      const excelBlob = await exportUtils.toExcel(spreadsheetData, filename);
      const buffer = Buffer.from(await excelBlob.arrayBuffer());
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      res.status(200).send(buffer);
      return;
    }

    if (format === 'csv') {
      const csvBlob = await exportUtils.toCsv(spreadsheetData, filename);
      const csvText = await csvBlob.text();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.status(200).send(csvText);
      return;
    }
    
    res.status(400).json({ message: "Invalid export format. Use 'xlsx' or 'csv'." });
    return;

  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Error exporting spreadsheet" });
    return;
  }
}

export default apiHandler(handler);