import express, { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { Post } from '../models/Post';
import { User } from '../models/User';
import authMiddleware from '../middleware/Auth';
import { v4 } from 'uuid';

const router = express.Router({ mergeParams: true }); // Supaya bisa akses :id dari parent route (/post/:id/comments)

// Ambil semua komentar dari suatu post
router.get('/', async (req: Request, res: Response) => {
  try {
    const { id: post_id } = req.params;

    const comments = await Comment.findAll({
      where: { post_id },
      include: [{ model: User, attributes: ['username'] }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ message: 'Failed to get comments' });
  }
});

// Buat komentar baru di suatu post
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const post_id  = req.params.id;
    const { content } = req.body;
    const user_id = req.user?.id;

    console.log("\n\n\n\n", post_id)
    console.log("\n\n\n\n", content)
    console.log("\n\n\n\n", user_id)

    const post = await Post.findByPk(post_id);
    if (!post) {
      res.status(404).json({ message: 'Post not found', post_id });
      return;
    }
    if (post.user_id !== user_id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const comments = await Comment.create({
        id : v4(), // Generate a unique ID for the comment 
        user_id, 
        content, 
        post_id,  });

    res.status(201).json({ message: 'Comment created', comments });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Failed to create comment' });
  }
});

// Edit komentar
router.put('/:commentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const commentId  = req.params.id;
    const content  = req.body;
    const user_id = req.user!.id;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (comment.user_id !== user_id) {
      res.status(403).json({ message: 'Not authorized to edit this comment' });
      return;
    }

    comment.content = content;
    await comment.save();

    res.status(200).json({ message: 'Comment updated', comment });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Failed to update comment' });
  }
});

// Hapus komentar
router.delete('/:commentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const user_id = req.user!.id;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (comment.user_id !== user_id) {
      res.status(403).json({ message: 'Not authorized to delete this comment' });
      return;
    }

    await comment.destroy();
    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

export default router;