import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions) as Session | null;
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const userId = session.user.id;
  const { id } = req.query;
  const spreadsheetId = id as string;

  switch (req.method) {
    case 'GET':
      try {
        const spreadsheet = await prisma.spreadsheet.findFirst({
          where: {
            id: spreadsheetId,
            OR: [
              { userId },
              { shares: { some: { userId } } },
              { isPublic: true },
            ],
          },
        });

        if (!spreadsheet) {
          return res.status(404).json({ error: 'Spreadsheet not found' });
        }

        res.status(200).json(spreadsheet);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch spreadsheet' });
      }
      break;

    case 'PUT':
      try {
        const { name, data } = req.body;
        const spreadsheet = await prisma.spreadsheet.findFirst({
          where: {
            id: spreadsheetId,
            OR: [
              { userId },
              { shares: { some: { userId, permission: 'WRITE' } } },
            ],
          },
        });

        if (!spreadsheet) {
          return res.status(404).json({ error: 'Spreadsheet not found or permission denied' });
        }

        const updated = await prisma.spreadsheet.update({
          where: { id: spreadsheetId },
          data: {
            name,
            data,
            updatedAt: new Date(),
          },
        });

        res.status(200).json(updated);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update spreadsheet' });
      }
      break;

    case 'DELETE':
      try {
        const spreadsheet = await prisma.spreadsheet.findFirst({
          where: {
            id: spreadsheetId,
            userId,
          },
        });

        if (!spreadsheet) {
          return res.status(404).json({ error: 'Spreadsheet not found or permission denied' });
        }

        await prisma.spreadsheet.delete({
          where: { id: spreadsheetId },
        });

        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete spreadsheet' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}