import express from 'express';
import { Request, Response } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { UpvoteDownvote } from '../models/Upvote_Downvote_Post';
import multer from 'multer';
import authMiddleware from '../middleware/Auth';
// import router from './Profile';
import { v4 } from 'uuid';

// const config = require('../config/config.json');
import config from '../config/config.json';
const sequelize = new Sequelize({
    ...config.development,
    models: [User, Post],
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/post/'); // Directory to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });
const postRouter = express.Router();

postRouter.post('/submit', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
    try {
        const { title, image_url } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const post = await Post.create({
            id: v4(),
            user_id: userId,
            title: title,
            image_url: image_url,
        });

        return res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

postRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        const post = await Post.findByPk(postId);
        const upvotes = await UpvoteDownvote.count({
            where: { postId, voteType: 'upvote' },
        });
        const downvotes = await UpvoteDownvote.count({
            where: { postId, voteType: 'downvote' },
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        return res.status(200).json({post, upvotes, downvotes });
    } catch (error) {
        console.error('Error fetching post:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

postRouter.get('/posts', async (req: Request, res: Response) => {
    try {
        const type = req.body.type;

        let order: [string, string][] = [];

        if (type === 'fresh') {
            order = [['createdAt', 'DESC']];
        }
        // else if (type === 'popular') {
        //    order = something else
        // }

        const posts = await Post.findAll({ order });

        const postIds = posts.map(post => post.id);

        const votes = await UpvoteDownvote.findAll({
            where: { postId: postIds },
            attributes: ['postId', 'voteType', [sequelize.fn('COUNT', 'voteType'), 'count']],
            group: ['postId', 'voteType'],
        });

        const voteMap: { [key: string]: { upvote: number; downvote: number } } = {};

        for (const vote of votes) {
            const postId = vote.getDataValue('postId');
            const voteType = vote.getDataValue('voteType') as 'upvote' | 'downvote';
            const count = parseInt(vote.getDataValue('count'));
        
            if (!voteMap[postId]) {
                voteMap[postId] = { upvote: 0, downvote: 0 };
            }
            voteMap[postId][voteType] = count;
        }

        for (const post of posts) {
            const votes = voteMap[post.id] || { upvote: 0, downvote: 0 };
            post.dataValues.upvotes = votes.upvote;
            post.dataValues.downvotes = votes.downvote;
        }

        return res.status(200).json(posts);

    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default postRouter;