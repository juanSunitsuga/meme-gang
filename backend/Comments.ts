import express, { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { Post } from '../models/Post';
import { User } from '../models/User';
import authMiddleware from '../middleware/Auth';
import { controllerWrapper } from '../utils/controllerWrapper';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  controllerWrapper(async (req: Request) => {
    const { id: post_id } = req.params;

    const comments = await Comment.findAll({
      where: {
        post_id,
        reply_to: null, 
      },      
      include: [{ model: User, attributes: ['username', 'profilePicture'] }],
      order: [['createdAt', 'DESC']],
    });

    return comments;
  })
);

router.post(
  '/',
  authMiddleware,
  controllerWrapper(async (req: Request, res: Response) => {
    const post_id = req.params.id;
    const { content } = req.body;
    const user_id = req.user!.id;

    const post = await Post.findByPk(post_id);
    if (!post) {
      res.locals.errorCode = 404;
      throw new Error('Post not found');
    }

    if (post.user_id !== user_id) {
      res.locals.errorCode = 403;
      throw new Error('Unauthorized');
    }

    const comment = await Comment.create({
      id: uuidv4(),
      user_id,
      content,
      post_id,
    });

    return { message: 'Comment created', comment };
  })
);



// // ✅ Edit komentar
router.put(
  '/:commentId',
  authMiddleware,
  controllerWrapper(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const user_id = req.user!.id;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      res.locals.errorCode = 404;
      throw new Error('Comment not found');
    }

    if (comment.user_id !== user_id) {
      res.locals.errorCode = 403;
      throw new Error('Not authorized to edit this comment');
    }

    await comment.update({ content });

    return { message: 'Comment updated', comment };
  })
);

router.delete(
  '/',
  authMiddleware,
  controllerWrapper(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const user_id = req.user!.id;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      res.locals.errorCode = 404;
      throw new Error('Comment not found');
    }

    if (comment.user_id !== user_id) {
      res.locals.errorCode = 403;
      throw new Error('Not authorized to delete this comment');
    }

    await comment.destroy();
    return { message: 'Comment deleted' };
  })
);

export default router;
