import { Request, Response, Router } from 'express';
import { Votes } from '../models/Votes';
import authMiddleware from '../middleware/Auth';
import { controllerWrapper } from '../utils/controllerWrapper';
import { countVotes } from './FetchDataForSinglePost';

const router = Router();

router.post('/upvote/:id', authMiddleware, controllerWrapper(async (req: Request, res: Response) => {
    const post_id = req.params.id;
    const user_id = req.user?.id;
    console.log(`User ${user_id} is upvoting post ${post_id}`);
    await Votes.create({
        post_id: post_id,
        user_id: user_id,
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

router.post('/downvote/:id', authMiddleware, controllerWrapper(async (req: Request, res: Response) => {
    const post_id = req.params.id;
    const user_id = req.user?.id;
    await Votes.create({
        post_id: post_id,
        user_id: user_id,
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

router.put('/upvote/:id', authMiddleware, controllerWrapper(async (req: Request, res: Response) => {
    const post_id = req.params.id;
    const user_id = req.user?.id;
    const upvote = await Votes.update({
        is_upvote: true,
        edited_at: new Date(),
    }, {
        where: {
            post_id: post_id,
            user_id: user_id,
        },
    });
    const { upvotes, downvotes } = await countVotes(post_id);
    return {
        message: 'Vote changed',
        upvotes,
        downvotes,
    };
}));

router.put('/downvote/:id', authMiddleware, controllerWrapper(async (req: Request, res: Response) => {
    const post_id = req.params.id;
    const user_id = req.user?.id;
    const downvote = await Votes.update({
        is_upvote: false,
        edited_at: new Date(),
    }, {
        where: {
            post_id: post_id,
            user_id: user_id,
        },
    });
    const { upvotes, downvotes } = await countVotes(post_id);
    return {
        message: 'Vote changed',
        upvotes,
        downvotes,
    };
}));

router.delete('/upvote/:id', authMiddleware, controllerWrapper(async (req: Request, res: Response) => {
    const post_id = req.params.id;
    const user_id = req.user?.id;
    await Votes.destroy({
        where: {
            post_id: post_id,
            user_id: user_id,
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

router.delete('/downvote/:id', authMiddleware, controllerWrapper(async (req: Request, res: Response) => {
    const post_id = req.params.id;
    const user_id = req.user?.id;
    await Votes.destroy({
        where: {
            post_id: post_id,
            user_id: user_id,
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