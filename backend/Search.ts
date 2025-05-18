import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Tag } from '../models/Tag';
import express from 'express';
import bodyParser from 'body-parser';
import { controllerWrapper } from '../utils/controllerWrapper';

const router = express.Router();
router.use(bodyParser.json());

// Endpoint to get user profile
router.get('/search', controllerWrapper(async (req: Request, res: Response) => {
    const { query } = req.query;

    if (!query) {
        return {
            status: 400,
            message: 'Query parameter is required'
        }
    }

    try {
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

        return {
            status: 200,
            data: {
                users: userResults,
                posts: postResults,
                tags: tagResults,
            }
        }
    } catch (error) {
        console.error('Error in search API:', error);
        return{
            status: 500,
            message: 'Internal Server Error'
        }
    }
}));

export default router;
