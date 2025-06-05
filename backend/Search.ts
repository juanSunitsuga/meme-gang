import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Post } from '../models/Post';
import { User } from '../models/User'; // pastikan ini di-import
import express from 'express';
import bodyParser from 'body-parser';
import { controllerWrapper } from '../utils/controllerWrapper';
import { appConfig } from '../config/app';
import jwt from 'jsonwebtoken';
import { buildPostWithAllData} from './FetchPostData';

const router = express.Router();
router.use(bodyParser.json());

router.get('/', controllerWrapper(async (req: Request, res: Response) => {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
        res.status(400).json({ message: 'Query parameter is required' });
        return 
    }

    const token = req.headers.authorization?.split(' ')[1];
        let userId = null;

    if (token) {
        try {
            const decoded = jwt.verify(token, appConfig.jwtSecret) as { id: string };
            userId = decoded.id;
        } catch (err) {
            console.warn("Invalid token:", err);
        }
    }

    try {
        const postResults = await Post.findAll({
            where: {
                title: { [Op.iLike]: `%${query}%` },
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'profilePicture'], // Include profile & username
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 20,
        });

        if (postResults.length === 0) {
            res.status(404).json({
                message: `No results found for "${query}".`,
                posts: [],
            });
        }

        return await buildPostWithAllData(postResults, userId);

    } catch (error) {
        console.error('Error in search API:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));

export default router;
