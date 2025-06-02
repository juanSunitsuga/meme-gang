import express, { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { User } from '../models/User';
import authMiddleware from '../middleware/Auth';
import { controllerWrapper } from '../utils/controllerWrapper';
// import { Op } from 'sequelize';

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

    // Recursive function to get replies and their replies
    const getReplies = async (parentId: string | number): Promise<any[]> => {
      const replies = await Comment.findAll({
        where: { reply_to: parentId },
        include: [
          {
            model: User,
            attributes: ['username', 'profilePicture'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      const repliesWithChildren = await Promise.all(
        replies.map(async (reply) => {
          const nestedReplies = await getReplies(reply.id); // recursive call
          return {
            ...reply.toJSON(),
            replies: nestedReplies,
          };
        })
      );

      return repliesWithChildren;
    };

    const allReplies = await getReplies(id);

    return res.json(allReplies);
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
      updatedAt: null,
    });

    return { message: 'Reply created', reply };
  })
);

router.put(
  '/', 
  authMiddleware,
  controllerWrapper(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user!.id;

    const reply = await Comment.findByPk(id);
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

    return res.json({
      message: 'Reply updated',
      reply,
    });
  })
);


// router.delete(
//   '/',
//   authMiddleware,
//   controllerWrapper(async (req: Request, res: Response) => {
//     const { replyId } = req.params;
//     const user_id = req.user!.id;

//     const reply = await Comment.findByPk(replyId);
//     if (!reply) {
//       res.locals.errorCode = 404;
//       throw new Error('Reply not found');
//     }

//     if (reply.user_id !== user_id) {
//       res.locals.errorCode = 403;
//       throw new Error('Not authorized to delete this reply');
//     }

//     await reply.destroy();
//     return { message: 'Reply deleted' };
//   })
// );
router.delete(
  '/',
  authMiddleware,
  controllerWrapper(async (req: Request, res: Response) => {
    const { id } = req.params; 

    console.log('Deleting comment with ID:', id);

    if (!id || typeof id !== 'string') {
      res.locals.errorCode = 400;
      throw new Error(`Invalid or missing Comment ID: ${id}`);
    }

    const user_id = req.user!.id;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      res.locals.errorCode = 404;
      throw new Error('Comment not found');
    }

    if (comment.user_id !== user_id) {
      res.locals.errorCode = 403;
      throw new Error('Not authorized to delete this comment');
    }

    const collectAllReplyIds = async (parentId: string): Promise<string[]> => {
      const replies = await Comment.findAll({ where: { reply_to: parentId } });

      const nestedIdsPromises = replies.map(async (reply) => {
        const childIds = await collectAllReplyIds(reply.id);
        return [reply.id, ...childIds];
      });

      const nestedIds = await Promise.all(nestedIdsPromises);
      return nestedIds.flat();
    };

    const allReplyIds = await collectAllReplyIds(comment.id);

    if (allReplyIds.length > 0) {
      await Comment.destroy({ where: { id: allReplyIds } });
    }

    // 🔥 Hapus komentar utama
    await comment.destroy();

    return res.json({ message: 'Comment and all nested replies deleted successfully' });
  })
);



export default router;