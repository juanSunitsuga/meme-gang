import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Session } from '../models/Session';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    try {
        const decoded = jwt.verify(token, 'meme-gang-lover') as { id: string };

        // Check if the token exists in the Session table
        const session = await Session.findOne({
            where: { token, userId: decoded.id },
        });

        if (!session) {
            return res.status(401).json({ message: 'Invalid or expired session' });
        }

        req.user = { id: decoded.id }; // Set `req.user` with the decoded token information
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired', expiredAt: error.expiredAt });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export default authMiddleware;