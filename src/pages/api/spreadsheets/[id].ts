// src/pages/api/spreadsheets/[id].ts

import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { apiHandler, AuthenticatedNextApiRequest, ApiResponse } from '@/lib/api-middleware';
import { SpreadsheetData, Sheet } from '@/types/spreadsheet';
import { Prisma } from '@prisma/client'; // ✅ FIX: Import Prisma types for casting

async function handler(
  req: AuthenticatedNextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const userId = req.user.id;
  const spreadsheetId = req.query.id as string;

  if (!spreadsheetId) {
    res.status(400).json({
      success: false, error: 'Spreadsheet ID is required.', timestamp: new Date().toISOString(),
    });
    return;
  }

  const getSpreadsheetWithPermissions = async (writeAccess = false) => {
    let whereClause: any = { id: spreadsheetId, OR: [{ isPublic: true }, { userId }, { shares: { some: { userId } } }] };
    if (writeAccess) {
      whereClause.OR = [{ userId }, { shares: { some: { userId, permission: { in: ['EDIT', 'ADMIN'] } } } }];
    }
    return await prisma.spreadsheet.findFirst({ where: whereClause });
  };

  switch (req.method) {
    case 'GET': {
      const spreadsheet = await getSpreadsheetWithPermissions(false);

      if (!spreadsheet) {
        res.status(404).json({ success: false, error: 'Spreadsheet not found or permission denied.', timestamp: new Date().toISOString() });
        return;
      }

      const prismaDataBlob = spreadsheet.data as any;
      let sheets: Sheet[] = [];
      let activeSheetId: string = '';

      if (prismaDataBlob.sheets && Array.isArray(prismaDataBlob.sheets)) {
        sheets = prismaDataBlob.sheets;
        activeSheetId = prismaDataBlob.activeSheetId || sheets[0]?.id;
      } else {
        const defaultSheet: Sheet = {
          id: 'sheet1', name: 'Sheet1', isActive: true, cells: prismaDataBlob.cells || {}, rowCount: prismaDataBlob.rowCount || 100, columnCount: prismaDataBlob.columnCount || 26, frozen: { rows: 0, columns: 0 }
        };
        sheets = [defaultSheet];
        activeSheetId = 'sheet1';
      }

      const responseData: SpreadsheetData = {
          id: spreadsheet.id, name: spreadsheet.name, sheets: sheets, activeSheetId: activeSheetId, charts: prismaDataBlob.charts || [], cells: {}, rowCount: 0, columnCount: 0
      };

      res.status(200).json({ success: true, data: responseData, timestamp: new Date().toISOString() });
      return;
    }

    case 'PUT': {
      const hasWriteAccess = await getSpreadsheetWithPermissions(true);

      if (!hasWriteAccess) {
        res.status(403).json({ success: false, error: 'Permission denied to edit this spreadsheet.', timestamp: new Date().toISOString() });
        return;
      }
      
      const updatedDataFromClient: SpreadsheetData = req.body;
      
      const jsonDataToSave = {
        sheets: updatedDataFromClient.sheets,
        activeSheetId: updatedDataFromClient.activeSheetId,
        charts: updatedDataFromClient.charts,
      };

      const updatedSpreadsheet = await prisma.spreadsheet.update({
        where: { id: spreadsheetId },
        data: {
          name: updatedDataFromClient.name,
          updatedAt: new Date(),
          // ✅ FIX: Cast the object to Prisma.JsonObject to satisfy the strict JSON type.
          data: jsonDataToSave as unknown as Prisma.JsonObject,
        },
      });

      res.status(200).json({ success: true, data: updatedSpreadsheet, timestamp: new Date().toISOString() });
      return;
    }

    case 'DELETE': {
      const spreadsheet = await prisma.spreadsheet.findFirst({ where: { id: spreadsheetId, userId } });

      if (!spreadsheet) {
        res.status(403).json({ success: false, error: 'Only the spreadsheet owner can delete it.', timestamp: new Date().toISOString() });
        return;
      }

      await prisma.spreadsheet.delete({ where: { id: spreadsheetId } });
      
      res.status(204).end();
      return;
    }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed`, timestamp: new Date().toISOString() });
      return; // ✅ FIX: Added the missing return statement here.
  }
}

export default apiHandler(handler);