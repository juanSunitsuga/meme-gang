import { Request, Response, Router } from 'express';
import { Post } from '../models/Post';
import { UpvoteDownvote } from '../models/Upvote_Downvote_Post';
import authMiddleware from '../middleware/Auth';
import { controllerWrapper } from '../utils/controllerWrapper';
import { v4 } from 'uuid';
import { countVotes } from './FetchPostData';

const router = Router();

router.post('/upvote:id', authMiddleware, controllerWrapper(async (req: Request, res: Response) => {
    const post_id = req.params.id;
    const user_id = req.user;
    const post = await Post.findByPk(post_id);
    if (!post) {
        res.locals.errorCode = 404;
        throw new Error('Post not found');
    }
    await UpvoteDownvote.create({
        id: v4(),
        post_id,
        user_id,
        is_upvote: true,
    });
    const { upvotes, downvotes } = await countVotes(post_id);
    return {
        message: 'Upvoted',
        upvotes,
        downvotes,
    };
}));

router.post('/downvote:id', authMiddleware, controllerWrapper(async (req: Request, res: Response) => {
    const post_id = req.params.id;
    const user_id = req.user;
    const post = await Post.findByPk(post_id);
    if (!post) {
        res.locals.errorCode = 404;
        throw new Error('Post not found');
    }
    await UpvoteDownvote.create({
        id: v4(),
        post_id,
        user_id,
        is_upvote: false,
    });
    const { upvotes, downvotes } = await countVotes(post_id);
    return {
        message: 'Downvoted',
        upvotes,
        downvotes,
    };
}));

router.delete('/upvote:id', authMiddleware, controllerWrapper(async (req: Request, res: Response) => {
    const post_id = req.params.id;
    const user_id = req.user;
    const post = await Post.findByPk(post_id);
    if (!post) {
        res.locals.errorCode = 404;
        throw new Error('Post not found');
    }
    await UpvoteDownvote.destroy({
        where: {
            post_id,
            user_id,
            is_upvote: true,
        },
    });
    const { upvotes, downvotes } = await countVotes(post_id);
    return {
        message: 'Upvote removed',
        upvotes,
        downvotes,
    };
}));

router.delete('/downvote:id', authMiddleware, controllerWrapper(async (req: Request, res: Response) => {
    const post_id = req.params.id;
    const user_id = req.user;
    const post = await Post.findByPk(post_id);
    if (!post) {
        res.locals.errorCode = 404;
        throw new Error('Post not found');
    }
    await UpvoteDownvote.destroy({
        where: {
            post_id,
            user_id,
            is_upvote: false,
        },
    });
    const { upvotes, downvotes } = await countVotes(post_id);
    return {
        message: 'Downvote removed',
        upvotes,
        downvotes,
    };
}));