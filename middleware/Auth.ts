import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import { Session } from '../models/Session';
import { CustomRequest } from '../types';

// // Middleware to authenticate the user
// const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ message: 'Access token is missing or invalid' });
//     }

//     try {
//         const decoded: any = jwt.verify(token, JWT_SECRET);
//         req.user = { id: decoded.id };
//         next();
//     } catch (error) {
//         return res.status(403).json({ message: 'Invalid or expired token' });
//     }
// };

const authMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    console.log('Authorization Header:', authHeader);

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    try {
        const decoded = jwt.verify(token, 'meme-gang-lover') as { id: number; username: string };

        // Check if the token exists in the Authorization table and is not expired
        const authorization = await Session.findOne({
            where: {
                token,
                userId: decoded.id,
                expiresAt: {
                    [Op.gt]: new Date(),
                },
            },
        });

        if (!authorization) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export default authMiddleware;