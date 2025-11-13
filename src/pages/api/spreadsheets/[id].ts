// src/pages/api/spreadsheets/[id].ts

import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { apiHandler, AuthenticatedNextApiRequest, ApiResponse } from '@/lib/api-middleware';

async function handler(
  req: AuthenticatedNextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const userId = req.user.id;
  const spreadsheetId = req.query.id as string;

  if (!spreadsheetId) {
    res.status(400).json({
      success: false,
      error: 'Spreadsheet ID is required.',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // --- Permission Check Logic ---
  const getSpreadsheetWithPermissions = async (writeAccess = false) => {
    const whereClause: any = {
      id: spreadsheetId,
      OR: [
        { isPublic: true },
        { userId },
        { shares: { some: { userId } } },
      ],
    };
    
    // If write access is required, tighten the permissions
    if (writeAccess) {
      whereClause.OR = [
        { userId }, // Owner has write access
        { shares: { some: { userId, permission: { in: ['EDIT', 'ADMIN'] } } } },
      ];
    }
    
    return await prisma.spreadsheet.findFirst({ where: whereClause });
  };

  switch (req.method) {
    case 'GET': {
      const spreadsheet = await getSpreadsheetWithPermissions(false); // Read access is enough

      if (!spreadsheet) {
        res.status(404).json({ success: false, error: 'Spreadsheet not found or you do not have permission to view it.', timestamp: new Date().toISOString() });
        return;
      }

      res.status(200).json({ success: true, data: spreadsheet, timestamp: new Date().toISOString() });
      return;
    }

    case 'PUT': {
      const hasWriteAccess = await getSpreadsheetWithPermissions(true);

      if (!hasWriteAccess) {
        res.status(403).json({ success: false, error: 'You do not have permission to edit this spreadsheet.', timestamp: new Date().toISOString() });
        return;
      }
      
      const { name, data } = req.body;
      const updateData: any = { updatedAt: new Date() };
      if (name) updateData.name = name;
      if (data) updateData.data = data;
      
      const updatedSpreadsheet = await prisma.spreadsheet.update({
        where: { id: spreadsheetId },
        data: updateData,
      });

      res.status(200).json({ success: true, data: updatedSpreadsheet, timestamp: new Date().toISOString() });
      return;
    }

    case 'DELETE': {
       // Only the owner can delete a spreadsheet
      const spreadsheet = await prisma.spreadsheet.findFirst({
        where: { id: spreadsheetId, userId },
      });

      if (!spreadsheet) {
        res.status(403).json({ success: false, error: 'Only the owner can delete this spreadsheet.', timestamp: new Date().toISOString() });
        return;
      }

      await prisma.spreadsheet.delete({
        where: { id: spreadsheetId },
      });
      
      res.status(204).end(); // 204 No Content is standard for successful DELETE
      return;
    }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed`,
        timestamp: new Date().toISOString(),
      });
      return;
  }
}

export default apiHandler(handler);