import e, { Request, Response, Router } from 'express';
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
    await UpvoteDownvote.create({
        post_id,
        user_id,
        is_upvote: true,
        edited_at: new Date(),
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
    await UpvoteDownvote.create({
        post_id,
        user_id,
        is_upvote: false,
        edited_at: new Date(),
    });
    const { upvotes, downvotes } = await countVotes(post_id);
    return {
        message: 'Downvoted',
        upvotes,
        downvotes,
    };
}));

router.put('/upvote:id', authMiddleware, controllerWrapper(async (req: Request, res: Response) => {
    const post_id = req.params.id;
    const user_id = req.user;
    const post = await Post.findByPk(post_id);
    const upvote = await UpvoteDownvote.update({
        is_upvote: true,
        edited_at: new Date(),
    }, {
        where: {
            post_id,
            user_id,
        },
    });
    const { upvotes, downvotes } = await countVotes(post_id);
    return {
        message: 'Vote changed',
        upvotes,
        downvotes,
    };
}));

router.put('/downvote:id', authMiddleware, controllerWrapper(async (req: Request, res: Response) => {
    const post_id = req.params.id;
    const user_id = req.user;
    const post = await Post.findByPk(post_id);
    const downvote = await UpvoteDownvote.update({
        is_upvote: false,
        edited_at: new Date(),
    }, {
        where: {
            post_id,
            user_id,
        },
    });
    const { upvotes, downvotes } = await countVotes(post_id);
    return {
        message: 'Vote changed',
        upvotes,
        downvotes,
    };
}));

router.delete('/upvote:id', authMiddleware, controllerWrapper(async (req: Request, res: Response) => {
    const post_id = req.params.id;
    const user_id = req.user;
    const post = await Post.findByPk(post_id);
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

export default router;