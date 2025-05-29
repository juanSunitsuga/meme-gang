import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Post } from '../models/Post';
import express from 'express';
import bodyParser from 'body-parser';
import { controllerWrapper } from '../utils/controllerWrapper';

const router = express.Router();
router.use(bodyParser.json());
// Endpoint to search users, posts, and tags
router.get('/', controllerWrapper(async (req: Request, res: Response) => {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
        res.status(400).json({ message: 'Query parameter is required' });
        return;
    }

    console.log("query", query);

    try {

        // Search posts by title (case-insensitive)
        const postResults = await Post.findAll({
            where: {
                title: { [Op.iLike]: `%${query}%` },
            },
            limit: 20,
        });


        console.log("post", postResults);


        if (postResults.length === 0) {
            res.status(404).json({
                message: `No results found for "${query}".`,
                posts: [],
            });
            return;
        }

        res.status(200).json(postResults);

    } catch (error) {
        console.error('Error in search API:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));

export default router;
