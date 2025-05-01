import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Tag } from '../models/Tag';
import express from 'express';
import bodyParser from 'body-parser';

const router = express.Router();
router.use(bodyParser.json());

// Endpoint to get user profile
router.get('/search', async (req: Request, res: Response) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    try {
        // Search for matching usernames, post titles, or tags
        const userResults = await User.findAll({
            where: {
                username: { [Op.iLike]: `%${query}%` }, // Case-insensitive search for usernames
            },
        });

        const postResults = await Post.findAll({
            where: {
                title: { [Op.iLike]: `%${query}%` }, // Case-insensitive search for post titles
            },
        });

        const tagResults = await Tag.findAll({
            where: {
                name: { [Op.iLike]: `%${query}%` }, // Case-insensitive search for tags
            },
        });

        res.status(200).json({
            users: userResults,
            posts: postResults,
            tags: tagResults,
        });
    } catch (error) {
        console.error('Error in search API:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
