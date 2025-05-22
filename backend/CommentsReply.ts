import express, { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { User } from '../models/User';
import authMiddleware from '../middleware/Auth';
import { controllerWrapper } from '../utils/controllerWrapper';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  controllerWrapper(async (req: Request, res: Response) => {
    const { id } = req.params;

    const mainComment = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['username', 'profilePicture'],
        },
      ],
    });

    if (!mainComment) {
      res.locals.errorCode = 404;
      throw new Error('Comment not found');
    }

    const replies = await Comment.findAll({
      where: { reply_to: id },
      include: [
        {
          model: User,
          attributes: ['username', 'profilePicture'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return {
      id: mainComment.id,
      user: {
        name: mainComment.user.username,
        avatar: mainComment.user.profilePicture,
      },
      text: mainComment.content,
      createdAt: mainComment.createdAt,
      replies: replies.map(reply => ({
        id: reply.id,
        user: {
          name: reply.user.username,
          avatar: reply.user.profilePicture,
        },
        text: reply.content,
        createdAt: reply.createdAt,
      })),
    };
  })
);

router.post(
  '/',
  authMiddleware,
  controllerWrapper(async (req: Request, res: Response) => {
    const { id: reply_to } = req.params;
    const { content } = req.body;
    const user_id = req.user!.id;

    const parentComment = await Comment.findByPk(reply_to);
    if (!parentComment) {
      res.locals.errorCode = 404;
      throw new Error('Parent comment not found');
    }

    const reply = await Comment.create({
      content,
      post_id: parentComment.post_id,
      reply_to,
      user_id,
    });

    return { message: 'Reply created', reply };
  })
);

router.put(
  '/:replyId',
  authMiddleware,
  controllerWrapper(async (req: Request, res: Response) => {
    const { replyId } = req.params;
    const { content } = req.body;
    const user_id = req.user!.id;

    const reply = await Comment.findByPk(replyId);
    if (!reply) {
      res.locals.errorCode = 404;
      throw new Error('Reply not found');
    }

    if (reply.user_id !== user_id) {
      res.locals.errorCode = 403;
      throw new Error('Not authorized to edit this reply');
    }

    reply.content = content;
    await reply.save();

    return { message: 'Reply updated', reply };
  })
);

router.delete(
  '/:replyId',
  authMiddleware,
  controllerWrapper(async (req: Request, res: Response) => {
    const { replyId } = req.params;
    const user_id = req.user!.id;

    const reply = await Comment.findByPk(replyId);
    if (!reply) {
      res.locals.errorCode = 404;
      throw new Error('Reply not found');
    }

    if (reply.user_id !== user_id) {
      res.locals.errorCode = 403;
      throw new Error('Not authorized to delete this reply');
    }

    await reply.destroy();
    return { message: 'Reply deleted' };
  })
);

export default router;
