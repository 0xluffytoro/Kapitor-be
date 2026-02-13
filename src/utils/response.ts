import { Response } from 'express';

/**
 * Standardized API response utility
 */

/**
 * Send success response
 * @param res - Express response object
 * @param data - Response data
 * @param statusCode - HTTP status code
 */
export function sendSuccess(
  res: Response,
  data: unknown,
  statusCode = 200
): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Send error response
 * @param res - Express response object
 * @param error - Error message or Error object
 * @param statusCode - HTTP status code
 * @param details - Additional error details
 */
export function sendError(
  res: Response,
  error: string | Error,
  statusCode = 500,
  details: unknown = null
): void {
  const message = error instanceof Error ? error.message : error;
  const response: {
    success: false;
    error: string;
    details?: unknown;
  } = {
    success: false,
    error: message,
  };

  if (details) {
    response.details = details;
  }

  res.status(statusCode).json(response);
}
