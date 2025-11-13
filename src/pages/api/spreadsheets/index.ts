// src/pages/api/spreadsheets/index.ts

import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { apiHandler, AuthenticatedNextApiRequest, ApiResponse } from '@/lib/api-middleware';

async function handler(
  req: AuthenticatedNextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const userId = req.user.id;

  switch (req.method) {
    case 'GET': {
      const spreadsheets = await prisma.spreadsheet.findMany({
        where: {
          OR: [
            { userId },
            { shares: { some: { userId } } }, // Also include spreadsheets shared with the user
          ],
        },
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: spreadsheets,
        timestamp: new Date().toISOString(),
      });
    }

    case 'POST': {
      const { name = 'Untitled Spreadsheet' } = req.body;

      const newSpreadsheet = await prisma.spreadsheet.create({
        data: {
          name,
          userId,
          // The default data is now handled by the Prisma schema, so we don't need to specify it here.
        },
        select: {
          id: true, // Only return the ID, which is all the client needs for redirection.
        },
      });

      return res.status(201).json({
        success: true,
        data: newSpreadsheet,
        timestamp: new Date().toISOString(),
      });
    }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed`,
        timestamp: new Date().toISOString(),
      });
  }
}

export default apiHandler(handler);