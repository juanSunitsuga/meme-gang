import express, { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { User } from '../models/User';
import authMiddleware from '../middleware/Auth';

const router = express.Router({ mergeParams: true }); // mergeParams penting biar bisa akses :commentsId

// Lihat semua reply dari suatu komentar
router.get('/', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get the main comment
    const mainComment = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['username', 'profilePicture'],
        },
      ],
    });

    if (!mainComment) {
      res.status(404).json({ message: 'Comment not found' });
      return 
    }

    // Get replies of the main comment
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

    res.status(200).json({
      id: mainComment.id,
      user: {
        name: mainComment.user.username,
        avatar: mainComment.user.profilePicture, // 👈 match frontend expectations
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
    });
  } catch (error) {
    console.error('Error getting comment and replies:', error);
    res.status(500).json({ message: 'Failed to get comment and replies' });
  }
});


// Buat reply ke suatu komentar
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id: reply_to } = req.params;
    const { content } = req.body;
    const user_id = req.user!.id;

    const parentComment = await Comment.findByPk(reply_to);
    if (!parentComment) {
      res.status(404).json({ message: 'Parent comment not found' });
      return;
    }

    const reply = await Comment.create({
      content,
      post_id: parentComment.post_id,
      reply_to,
      user_id,
    });

    res.status(201).json({ message: 'Reply created', reply });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ message: 'Failed to create reply' });
  }
});

// Edit reply
router.put('/:replyId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const replyId = req.params.replyId;  // Gunakan replyId dari params
    const { content } = req.body;
    const user_id = req.user!.id;

    const reply = await Comment.findByPk(replyId);
    if (!reply || reply.user_id !== user_id) {
      res.status(403).json({ message: 'Not authorized to edit this reply' });
      return;
    }

    reply.content = content;
    await reply.save();

    res.status(200).json({ message: 'Reply updated', reply });
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({ message: 'Failed to update reply' });
  }
});

// Hapus reply
router.delete('/:replyId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const replyId = req.params.replyId;  // Gunakan replyId dari params
    const user_id = req.user!.id;

    const reply = await Comment.findByPk(replyId);
    if (!reply || reply.user_id !== user_id) {
      res.status(403).json({ message: 'Not authorized to delete this reply' });
      return;
    }

    await reply.destroy();
    res.status(200).json({ message: 'Reply deleted' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ message: 'Failed to delete reply' });
  }
});

export default router;