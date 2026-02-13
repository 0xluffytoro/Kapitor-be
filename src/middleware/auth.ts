import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  uid?: string;
}

/**
 * Middleware to verify JWT and attach uid to request
 */
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Missing or invalid Authorization header', 401);
      return;
    }

    const token = authHeader.slice(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      sendError(res, 'Authentication not configured', 500);
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as { uid: string };
    req.uid = decoded.uid;

    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
}
