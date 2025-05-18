import express from 'express';
import { Request, Response, Router } from 'express';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { UpvoteDownvote } from '../models/Upvote_Downvote_Post';
import multer from 'multer';
import authMiddleware from '../middleware/Auth';
import { controllerWrapper } from '../utils/controllerWrapper';
import { v4 } from 'uuid';
import sequelize, { Op } from 'sequelize';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/posts/'); // Directory to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

const router = Router();

const countVotes = async (postId: string): Promise<{ upvotes: number; downvotes: number }> => {
    const upvotes = await UpvoteDownvote.count({
        where: { post_id: postId, is_upvote: true },
    });
    const downvotes = await UpvoteDownvote.count({
        where: { post_id: postId, is_upvote: false },
    });
    return { upvotes, downvotes };
}

router.post(
    '/submit',
    authMiddleware,
    upload.single('image'),
    controllerWrapper(async (req: Request, res: Response) => {
        const { title } = req.body;
        const userId = req.user;

        if (!userId) {
            res.locals.errorCode = 401;
            throw new Error('Unauthorized');
        }

        if (!req.file) {
            res.locals.errorCode = 400;
            throw new Error('Image file is required');
        }

        const imageUrl = `/uploads/posts/${req.file.filename}`; // Public URL path

        const date = new Date();
        const post = await Post.create({
            id: v4(),
            user_id: userId.id,
            title,
            image_url: imageUrl,
            createdAt: date,
            updatedAt: date,
        });

        const votes = await countVotes(post.id);
        return { post, votes };
    })
);


router.get(
    '/', 
    controllerWrapper(async (req: Request, res: Response) => {
        const type = req.query.type as string;

        let order: [string, string][] = [];

        let popular = false;

        if (type === 'fresh') {
            order = [['createdAt', 'DESC']];
        }
        else if (type === 'popular') {
            popular = true;
        }

        // Fetch all posts
        const posts = await Post.findAll({ order, limit: 10 });

        // Get all post IDs
        const postIds = posts.map(post => post.id);

        // Aggregate upvotes and downvotes for all posts
        const votes = await UpvoteDownvote.findAll({
            where: { post_id: { [Op.in]: postIds } },
            attributes: [
                'post_id',
                [sequelize.fn('SUM', sequelize.literal('CASE WHEN is_upvote THEN 1 ELSE 0 END')), 'upvotes'],
                [sequelize.fn('SUM', sequelize.literal('CASE WHEN is_upvote THEN 0 ELSE 1 END')), 'downvotes'],
            ],
            group: ['post_id'],
            raw: true,
        }) as unknown as Array<{ post_id: string; upvotes: number; downvotes: number }>;
        
        const comments = await Comment.findAll({
            where: { post_id: { [Op.in]: postIds } },
            attributes: [
                'post_id',
                [sequelize.fn('COUNT', sequelize.col('id')), 'commentCount'],
            ],
            group: ['post_id'],
            raw: true,
        }) as unknown as Array<{ post_id: string; commentCount: string }>;
       
        // Create a map: post_id -> { upvotes, downvotes }
        const voteMap: { [key: string]: { upvotes: number; downvotes: number } } = {};
        for (const vote of votes) {
            voteMap[vote.post_id] = {
                upvotes: Number(vote.upvotes),
                downvotes: Number(vote.downvotes),
            };
        }

        // Create a map: post_id -> commentCount
        const commentMap: { [key: string]: number } = {};
        for (const c of comments) {
            commentMap[c.post_id] = Number(c.commentCount);
        }

        // Attach upvotes and downvotes to each post
        const postsWithVotes = posts.map(post => {
            const votes = voteMap[post.id] || { upvotes: 0, downvotes: 0 };
            const commentCount = commentMap[post.id] || 0;
            return {
                ...post.toJSON(),
                upvotes: votes.upvotes,
                downvotes: votes.downvotes,
                commentsCount: commentCount,
            };
        });

        if (popular) {
            postsWithVotes.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        }

        return postsWithVotes;
    })
);

router.get(
    '/:id',
    controllerWrapper(async (req, res) => {
        const postId = req.params.id;
        const post = await Post.findByPk(postId);
        if (!post) {
            res.locals.errorCode = 401;
            throw new Error('Post not found');
        }
        const votes = await countVotes(postId);
        return {post, votes};
    })
);

export default router;