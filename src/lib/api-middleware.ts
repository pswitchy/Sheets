// src/lib/api-middleware.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react'; // Use getSession on the server-side

// Standard response structure for all API endpoints
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
};

// Extends NextApiRequest to include the session user
export interface AuthenticatedNextApiRequest extends NextApiRequest {
  user: {
    id: string;
  };
}

export function apiHandler(
  handler: (req: AuthenticatedNextApiRequest, res: NextApiResponse<ApiResponse>) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
    try {
      const session = await getSession({ req });
      if (!session?.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
          timestamp: new Date().toISOString(),
        });
      }

      // Attach user to the request object for easy access in the handler
      const authenticatedReq = req as AuthenticatedNextApiRequest;
      authenticatedReq.user = { id: session.user.id };

      await handler(authenticatedReq, res);
    } catch (error: any) {
      console.error('API Error:', error);
      // Ensure we don't leak sensitive error details
      const message = error.message || 'An unexpected internal server error occurred.';
      return res.status(500).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      });
    }
  };
}