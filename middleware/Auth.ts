// npm install jsonwebtoken
// npm install --save-dev @types/jsonwebtoken

import { Session } from '../models/Session';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include the user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
import { Op } from 'sequelize';

const deleteInactiveSessions = async () => {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    await Session.destroy({
        where: {
            lastActivity: {
                [Op.lt]: fifteenMinutesAgo,
            },
        },
    });
};

setInterval(deleteInactiveSessions, 60 * 1000); // Run every 60 seconds

export const addSession = async (userId: string, token: string) => {
    await Session.create({ userId, token });
};


export const removeSession = async (userId: string) => {
    await Session.destroy({ where: { userId } });
};


const JWT_SECRET = 'meme-gang-lover';

const activeSessions: { [key: string]: boolean } = {};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token is missing or invalid' });
    }

    jwt.verify(token, JWT_SECRET, (err, user: any) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        // Check if the user is in an active session
        if (!activeSessions[user.id]) {
            return res.status(403).json({ message: 'User session is invalid or expired' });
        }

        // Attach user info to the request object
        req.user = user;
        next();
    });
};

// Example: Add a user to the active session store
export const addUserToSession = (userId: string) => {
    activeSessions[userId] = true;
};

// Example: Remove a user from the active session store
export const removeUserFromSession = (userId: string) => {
    delete activeSessions[userId];
};