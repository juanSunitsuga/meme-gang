import express from 'express';
import { SavedPost } from '../models/Saved_Post';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Tag } from '../models/Tag';
import { controllerWrapper } from '../utils/controllerWrapper';
import authMiddleware from '../middleware/Auth';

const router = express.Router();
router.use(express.json());

router.get('/saved-posts', authMiddleware, controllerWrapper(async (req, res) => {
    const { id } = req.user!;
    if (!id) {
        res.locals.errorCode = 401;
        throw new Error('Unauthorized: User not authenticated');
    }
    const user = await User.findByPk(id);
    if (!user) {
        res.locals.errorCode = 404;
        throw new Error('User not found');
    }
    const savedPosts = await SavedPost.findAll({
        where: { user_id: id },
        include: [
            {
                model: Post,
                as: 'post',
                attributes: ['id'],
            },
        ],
    });
    return {
        message: 'Saved posts retrieved successfully',
        data: savedPosts.map(savedPost => ({
            id: savedPost.id,
            post_id: savedPost.post_id,
        })),
    };
}));

router.post('/save-post/:postId', authMiddleware, controllerWrapper(async (req, res) => {
    const { id } = req.user!;
    const { postId } = req.params; 

    if (!postId) {
        res.locals.errorCode = 400;
        throw new Error('Post ID is required');
    }

    const user = await User.findByPk(id);
    if (!user) {
        res.locals.errorCode = 404;
        throw new Error('User not found');
    }

    const post = await Post.findByPk(postId);
    if (!post) {
        res.locals.errorCode = 404;
        throw new Error('Post not found');
    }

    const savedPost = await SavedPost.create({ user_id: id, post_id: postId });
    
    return {
        message: 'Post saved successfully',
        data: {
            user_id: savedPost.user_id,
            post_id: savedPost.post_id
        }
    };
}));

router.delete('/save-post/:postId', authMiddleware, controllerWrapper(async (req, res) => {
    const { id } = req.user!;
    const { postId } = req.params;

    if (!postId) {
        res.locals.errorCode = 400;
        throw new Error('Post ID is required');
    }

    const deleted = await SavedPost.destroy({
        where: {
            user_id: id,
            post_id: postId
        }
    });

    if (!deleted) {
        res.locals.errorCode = 404;
        throw new Error('Saved post not found');
    }

    return {
        message: 'Post unsaved successfully'
    };
}));

router.get('/saved-posts-with-details', authMiddleware, controllerWrapper(async (req, res) => {
    const { id } = req.user!;
    
    const savedPosts = await SavedPost.findAll({
        where: { user_id: id },
        include: [
            {
                model: Post,
                as: 'post',
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['name', 'profilePicture']
                    },
                    {
                        model: Tag,
                        as: 'tags',
                        attributes: ['name'],
                        through: { attributes: [] }
                    }
                ]
            }
        ],
        order: [['saved_at', 'DESC']]
    });
    
    // Transform the data to a simpler format
    const formattedPosts = savedPosts.map(savedPost => {
        const post = savedPost.post;
        return {
            id: post.id,
            title: post.title,
            image_url: post.image_url,
            user: {
                name: post.user.name,
                profilePicture: post.user.profilePicture
            },
            createdAt: post.createdAt,
            upvotes: post.upvotes || 0,
            downvotes: post.downvotes || 0,
            commentsCount: post.commentsCount || 0,
            tags: post.tags.map(tag => tag.name),
            saved_at: savedPost.saved_at
        };
    });

    return {
        message: 'Saved posts retrieved successfully',
        data: formattedPosts
    };
}));

export default router;