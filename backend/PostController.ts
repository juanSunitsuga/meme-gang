import { Request, Response, Router } from 'express';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { Tag } from '../models/Tag';
import { Votes } from '../models/Votes';
import { PostTag } from '../models/PostTags';
import multer from 'multer';
import authMiddleware from '../middleware/Auth';
import { controllerWrapper } from '../utils/controllerWrapper';
import { v4 } from 'uuid';
import sequelize, { Op } from 'sequelize';
import { countVotes, countComments} from './FetchPostData';
import jwt, { decode } from 'jsonwebtoken';
import { appConfig } from '../config/app';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/posts/'); // Directory to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

const router = Router();

router.post(
    '/submit',
    authMiddleware,
    upload.single('image'),
    controllerWrapper(async (req: Request, res: Response) => {
        const { title } = req.body;
        const userId = req.user;
        const tags: string[] = Array.isArray(req.body.tag) ? req.body.tag : [req.body.tag];

        if (!title) {
            res.locals.errorCode = 400;
            throw new Error('Title is required');
        }

        if (!userId) {
            res.locals.errorCode = 401;
            throw new Error('Unauthorized');
        }

        if (!req.file) {
            res.locals.errorCode = 400;
            throw new Error('Image file is required');
        }

        // Create the post first to get its ID
        const imageUrl = `/uploads/posts/${req.file.filename}`; // Public URL path
        const date = new Date();
        const post = await Post.create({
            id: v4(),
            user_id: userId.id,
            title: title,
            image_url: imageUrl,
            createdAt: date,
            updatedAt: date,
        });

        // Execute if user added tags to the post
        if (tags.length > 0) {
            //Fetch existing tags from the database
            const existingTags = await Tag.findAll({
                where: {
                    tag_name: {
                        [Op.in]: tags,
                    },
                },
            });

            // Get the tag names that exist
            const existingTagNames = existingTags.map(tag => tag.tag_name);
    
            // Find tags that do not exist yet
            const newTags = tags.filter(tag => !existingTagNames.includes(tag));
    
            // Insert new tags into the Tags table
            const createdTags = await Promise.all(
                newTags.map(async (tagName) => {
                    return await Tag.create({
                        id: v4(),
                        tag_name: tagName,
                    });
                })
            );
    
            // Combine existing and newly created tags
            const allTagInstances = [
                ...existingTags,
                ...createdTags
            ];
    
            // Add entries to PostTags table using the PostTags model
            await Promise.all(
                allTagInstances.map(async (tag) => {
                    await PostTag.create({
                        post_id: post.id,
                        tag_id: tag.id,
                    });
                })
            );
        }

        const result = {
            ...post.toJSON(),
            upvotes: 0,
            downvotes: 0,
            commentsCount: 0,
            tags: tags || [],
        };

        return result;
    })
);

router.get(
    '/', 
    controllerWrapper(async (req: Request, res: Response) => {
        const token = req.headers.authorization?.split(' ')[1];

        let userId = null;

        if (token) {
            const decoded = jwt.verify(token, appConfig.jwtSecret);
            userId = decoded.id;
        }

        const type = req.query.type as string;

        let order: [string, string][] = [];

        let popular = false;

        if (type === 'fresh') {
            order = [['createdAt', 'DESC']];
        }
        else if (type === 'popular') {
            popular = true;
        }

        // Fetch all posts
        const posts = await Post.findAll({ order, limit: 10 });

        // Get all post IDs
        const postIds = posts.map(post => post.id);

        // Aggregate upvotes and downvotes for all posts
        const votes = await Votes.findAll({
            where: { post_id: { [Op.in]: postIds } },
            attributes: [
                'post_id',
                [sequelize.fn('SUM', sequelize.literal('CASE WHEN is_upvote THEN 1 ELSE 0 END')), 'upvotes'],
                [sequelize.fn('SUM', sequelize.literal('CASE WHEN is_upvote THEN 0 ELSE 1 END')), 'downvotes'],
            ],
            group: ['post_id'],
            raw: true,
        }) as unknown as Array<{ post_id: string; upvotes: number; downvotes: number }>;
        
        const comments = await Comment.findAll({
            where: { post_id: { [Op.in]: postIds } },
            attributes: [
                'post_id',
                [sequelize.fn('COUNT', sequelize.col('id')), 'commentCount'],
            ],
            group: ['post_id'],
            raw: true,
        }) as unknown as Array<{ post_id: string; commentCount: string }>;
       
        // Create a map: post_id -> { upvotes, downvotes }
        const voteMap: { [key: string]: { upvotes: number; downvotes: number } } = {};
        for (const vote of votes) {
            voteMap[vote.post_id] = {
                upvotes: Number(vote.upvotes),
                downvotes: Number(vote.downvotes),
            };
        }

        // Create a map: post_id -> commentCount
        const commentMap: { [key: string]: number } = {};
        for (const c of comments) {
            commentMap[c.post_id] = Number(c.commentCount);
        }

        // Fetch all PostTags for these posts
        const postTags = await PostTag.findAll({
            where: { post_id: { [Op.in]: postIds } },
            raw: true,
        });

        // Map post_id to array of tag_ids
        const postIdToTagIds: { [key: string]: string[] } = {};
        postTags.forEach(pt => {
            if (!postIdToTagIds[pt.post_id]) postIdToTagIds[pt.post_id] = [];
            postIdToTagIds[pt.post_id].push(pt.tag_id);
        });

        // Collect all unique tag IDs used in these posts
        const allTagIds = Array.from(new Set(postTags.map(pt => pt.tag_id)));

        // Query tag names for all unique tag IDs
        const tags = await Tag.findAll({
            where: { id: { [Op.in]: allTagIds } },
            raw: true,
        });

        // Map tag_id to tag_name for easy lookup
        const tagIdToName: { [key: string]: string } = {};
        tags.forEach(tag => {
            tagIdToName[tag.id] = tag.tag_name;
        });

        let userVotesMap: { [key: string]: boolean | null } = {};
        if (userId) {
            const userVotes = await Votes.findAll({
                where: {
                    post_id: { [Op.in]: postIds },
                    user_id: userId,
                },
                attributes: ['post_id', 'is_upvote'],
                raw: true,
            });
            userVotesMap = userVotes.reduce((acc, vote) => {
                acc[vote.post_id] = vote.is_upvote; // true or false
                return acc;
            }, {} as { [key: string]: boolean });
        }

        const postsWithVotes = posts.map(post => {
            const votes = voteMap[post.id] || { upvotes: 0, downvotes: 0 };
            const commentCount = commentMap[post.id] || 0;
            const tagIds = postIdToTagIds[post.id] || [];
            const tagNames = tagIds.map(tagId => tagIdToName[tagId]).filter(Boolean);
            const is_upvoted = userId ? (userVotesMap[post.id] ?? null) : null;
            console.log('is_upvoted:', is_upvoted);
            return {
                ...post.toJSON(),
                upvotes: votes.upvotes,
                downvotes: votes.downvotes,
                commentsCount: commentCount,
                tags: tagNames,
                is_upvoted: is_upvoted,
            };
        });

        if (popular) {
            postsWithVotes.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        }
        console.log(postsWithVotes);
        return postsWithVotes;
    })
);

router.get(
    '/:id',
    controllerWrapper(async (req: Request, res: Response) => {
        const user = req.user;
        const postId = req.params.id;
        const post = await Post.findByPk(postId);
        if (!post) {
            res.locals.errorCode = 401;
            throw new Error('Post not found');
        }
        const votesCount = await countVotes(postId);
        const commentCount = await countComments(postId);

        if (user) {
            const voteState = await Votes.findOne({
                where: { post_id: postId, user_id: user.id },
            });
            return {
                ...post.toJSON(),
                ...votesCount,
                commentsCount: commentCount,
                is_upvoted: voteState?.is_upvote,
            };
        }
        return {
            ...post.toJSON(),
            ...votesCount,
            commentsCount: commentCount,
        };
    })
);

router.put(
    '/:id',
    authMiddleware,
    upload.single('image'),
    controllerWrapper(async (req: Request, res: Response) => {
        const postId = req.params.id;
        const userId = req.user?.id;
        if (!userId) {
            res.locals.errorCode = 401;
            throw new Error('Unauthorized');
        }
        const post = await Post.findByPk(postId);
        if (!post) {
            res.locals.errorCode = 404;
            throw new Error('Post not found');
        }
        if (post.user_id !== userId) {
            res.locals.errorCode = 403;
            throw new Error('Forbidden: You can only edit your own posts');
        }

        const { title } = req.body;
        const tags: string[] = Array.isArray(req.body.tag) ? req.body.tag : [req.body.tag];

        if (!title || !tags) {
            res.locals.errorCode = 400;
            throw new Error('Title and tags are required');
        }

        let imageUrl = post.image_url;

        if (req.file) {
            imageUrl = `/uploads/posts/${req.file.filename}`;
        }

        post.title = title;
        post.image_url = imageUrl;
        await post.save();

        // Update tags
        await PostTag.destroy({ where: { post_id: postId } });

        // Check if the tag already exists in database
        const existingTags = await Tag.findAll({
            where: {
                tag_name: {
                    [Op.in]: tags,
                },
            },
        });

        // Get the tag names that exist
        const existingTagNames = existingTags.map(tag => tag.tag_name);

        // Find tags that do not exist yet
        const newTags = tags.filter(tag => !existingTagNames.includes(tag));

        // Insert new tags into the Tags table
        const createdTags = await Promise.all(
            newTags.map(async (tagName) => {
                return await Tag.create({
                    id: v4(),
                    tag_name: tagName,
                });
            })
        );

        // Combine existing and newly created tags
        const allTagInstances = [
            ...existingTags,
            ...createdTags
        ];

        // Add entries to PostTags table using the PostTags model
        await Promise.all(
            allTagInstances.map(async (tag) => {
                await PostTag.create({
                    post_id: post.id,
                    tag_id: tag.id,
                });
            })
        );
        const result = {
            ...post.toJSON(),
            upvotes: 0,
            downvotes: 0,
            commentsCount: 0,
            tags: tags,
        };
        return result;
    }
));

router.delete(
    '/:id',
    authMiddleware,
    controllerWrapper(async (req: Request, res: Response) => {
        const postId = req.params.id;
        const userId = req.user?.id;
        if (!userId) {
            res.locals.errorCode = 401;
            throw new Error('Unauthorized');
        }
        const post = await Post.findByPk(postId);
        if (!post) {
            res.locals.errorCode = 404;
            throw new Error('Post not found');
        }
        if (post.user_id !== userId) {
            res.locals.errorCode = 403;
            throw new Error('Forbidden: You can only delete your own posts');
        }
        await Post.destroy({ where: { id: postId } });
        await Votes.destroy({ where: { post_id: postId } });
        await Comment.destroy({ where: { post_id: postId } });
        return { message: 'Post deleted successfully' };
    })
);

export default router;