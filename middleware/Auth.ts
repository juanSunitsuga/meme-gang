import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Session } from '../models/Session';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, 'meme-gang-lover') as { id: string };
        const session = await Session.findOne({ where: { token, userId: decoded.id } });

        if (!session) {
            return res.status(401).json({ message: 'Unauthorized: Invalid or expired session' });
        }

        req.user = { id: decoded.id }; // Attach the user ID to req.user
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

export default authMiddleware;