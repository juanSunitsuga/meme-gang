import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Post } from '../models/Post';
import { User } from '../models/User'; // pastikan ini di-import
import express from 'express';
import bodyParser from 'body-parser';
import { controllerWrapper } from '../utils/controllerWrapper';

const router = express.Router();
router.use(bodyParser.json());

router.get('/', controllerWrapper(async (req: Request, res: Response) => {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
        res.status(400).json({ message: 'Query parameter is required' });
        return;
    }

    console.log("query", query);

    try {
        const postResults = await Post.findAll({
            where: {
                title: { [Op.iLike]: `%${query}%` },
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email'], // kamu bisa ubah sesuai field yang ingin ditampilkan
                }
            ],
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
