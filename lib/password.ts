// Password validation utilities

const APP_PASSWORD = process.env.APP_PASSWORD;

/**
 * Validate password from request header
 * Returns null if valid, error response if invalid
 */
export function validatePassword(password: string | null): { error: string; status: number } | null {
  if (password !== APP_PASSWORD) {
    return { error: 'Unauthorized', status: 401 };
  }
  return null;
}

/**
 * Get password from request headers
 */
export function getPasswordFromHeader(req: Request): string | null {
  return req.headers.get('x-password');
}
