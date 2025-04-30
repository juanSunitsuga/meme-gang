import { Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';


const router = Router();
router.use(bodyParser.json());

// Endpoint to get user profile
router.get('/search', async (req: Request, res: Response) => {
    try {
        const { name } = req.query;

        let whereClause: any = {};

        if (name) {
            whereClause.username = { [Op.iLike]: `%${name}%` }; // Case-insensitive search for username
        }

        const users = await User.findAll({ where: whereClause });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching for users:', error);
        res.status(500).json({ message: 'An error occurred while searching for users' });
    }
});

// Endpoint to get the logged-in user's profile
router.get('/profile', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, 'meme-gang-lover') as { id: string };

        const user = await User.findOne({
            where: { id: decoded.id },
            attributes: ['profilePicture', 'name', 'bio'],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile data:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
});
