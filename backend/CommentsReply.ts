import express, { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { User } from '../models/User';
import authMiddleware from '../middleware/Auth';

const router = express.Router({ mergeParams: true }); // mergeParams penting biar bisa akses :commentsId

// Lihat semua reply dari suatu komentar
router.get('/', async (req: Request, res: Response) => {
  try {
    const { commentsId: reply_to } = req.params;

    const replies = await Comment.findAll({
      where: { reply_to },
      include: [{ model: User, attributes: ['username'] }],
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json(replies);
  } catch (error) {
    console.error('Error getting replies:', error);
    res.status(500).json({ message: 'Failed to get replies' });
  }
});

// Buat reply ke suatu komentar
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { commentsId: reply_to } = req.params;
    const { content } = req.body;
    const user_id = req.user!.id;

    const parentComment = await Comment.findByPk(reply_to);
    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found' });
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

// ✏️ Edit reply
router.put('/:replyId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { replyId } = req.params;
    const { content } = req.body;
    const user_id = req.user!.id;

    const reply = await Comment.findByPk(replyId);
    if (!reply || reply.user_id !== user_id) {
      return res.status(403).json({ message: 'Not authorized to edit this reply' });
    }

    reply.content = content;
    await reply.save();

    res.status(200).json({ message: 'Reply updated', reply });
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({ message: 'Failed to update reply' });
  }
});

// ❌ Hapus reply
router.delete('/:replyId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { replyId } = req.params;
    const user_id = req.user!.id;

    const reply = await Comment.findByPk(replyId);
    if (!reply || reply.user_id !== user_id) {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    await reply.destroy();
    res.status(200).json({ message: 'Reply deleted' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ message: 'Failed to delete reply' });
  }
});

export default router;