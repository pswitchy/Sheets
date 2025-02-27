import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS and content type headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
        timestamp: new Date().toISOString()
      });
    }

    switch (req.method) {
      case 'GET':
        try {
          console.log('Fetching spreadsheets for user:', session.user.id);
          
          const spreadsheets = await prisma.spreadsheet.findMany({
            where: {
              OR: [
                { userId: session.user.id },
                { shares: { some: { userId: session.user.id } } },
              ],
            },
            select: {
              id: true,
              name: true,
              updatedAt: true,
              isPublic: true,
            },
            orderBy: {
              updatedAt: 'desc',
            },
          });

          console.log('Spreadsheets found:', spreadsheets.length);

          return res.status(200).json({
            success: true,
            data: spreadsheets,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Database error during GET:', error);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch spreadsheets',
            timestamp: new Date().toISOString()
          });
        }

      case 'POST':
        try {
          console.log('Creating new spreadsheet for user:', session.user.id);
          const { name = 'Untitled Spreadsheet' } = req.body;

          const spreadsheet = await prisma.spreadsheet.create({
            data: {
              name,
              userId: session.user.id,
              data: {
                cells: {},
                rowCount: 100,
                columnCount: 26,
              },
            },
            select: {
              id: true,
              name: true,
              updatedAt: true,
              isPublic: true,
            },
          });

          console.log('Created spreadsheet:', spreadsheet.id);

          return res.status(201).json({
            success: true,
            data: spreadsheet,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Database error during POST:', error);
          return res.status(500).json({
            success: false,
            error: 'Failed to create spreadsheet',
            timestamp: new Date().toISOString()
          });
        }

      default:
        console.log('Method not allowed:', req.method);
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} Not Allowed`,
          timestamp: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}