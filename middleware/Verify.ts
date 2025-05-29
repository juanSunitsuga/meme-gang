import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config/app';
import { middlewareWrapper } from '../utils/middlewareWrapper';

// Token blacklist to store invalidated tokens
export const tokenBlacklist = new Map<string, number>();

// Cleanup expired tokens from the blacklist periodically
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [token, expiryTime] of tokenBlacklist.entries()) {
    if (now >= expiryTime) {
      tokenBlacklist.delete(token);
      console.log(`Token removed from blacklist: expired at ${new Date(expiryTime * 1000).toISOString()}`);
    }
  }
}, 60 * 60 * 1000);

/**
 * Add a token to the blacklist until it expires
 * @param token The JWT token to blacklist
 * @param jwtExpiration Expiration time in seconds
 */
export async function addToBlacklist(token: string, jwtExpiration: string | number) {
  const decoded = jwt.decode(token) as { exp?: number };
  const expiryTime = decoded?.exp || Math.floor(Date.now() / 1000) + 
    (typeof jwtExpiration === 'number' ? jwtExpiration : parseInt(jwtExpiration, 10));
  
  tokenBlacklist.set(token, expiryTime);

  console.log(`Token blacklisted: ${token}, expires at: ${new Date(expiryTime * 1000).toISOString()}`);
  return true;
}

const verifySession = middlewareWrapper(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    if(tokenBlacklist.has(token)) {
      return res.status(401).json({ message: 'Token is blacklisted' });
    }
    
    const decoded = jwt.verify(token, appConfig.jwtSecret) as {
      id: string;
      email: string;
      name?: string;
    };
    
    req.user = { id: decoded.id, username: decoded.name || '', email: decoded.email };
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

export default verifySession;