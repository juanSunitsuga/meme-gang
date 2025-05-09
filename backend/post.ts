import express from 'express';
import { Request, Response } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { UpvoteDownvote } from '../models/Upvote_Downvote_Post';
import multer from 'multer';
import authMiddleware from '../middleware/Auth';
import { Router } from 'express';
import { controllerWrapper } from '../utils/controllerWrapper';
import config from '../config/config.json';
import { v4 } from 'uuid';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/post/'); // Directory to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });
const postRouter = express.Router();

const router = Router();

router.post(
    '/submit', authMiddleware, 
    // upload.single('image'), 
    controllerWrapper(async (req: Request, res: Response) => {
        
        // console.log(1);
        // try {
            const { title, img_url } = req.body;
            const userId = req.user;
            console.log(2);
            if (!userId) {
                console.log(3);
                res.locals.errorCode = 401;
                throw new Error('Unauthorized');
            }
            console.log(4);
            try {
            const post = await Post.create({
                id: v4(),
                user_id: userId.id,
                title: title,
                image_url: img_url,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        } catch (error){
            console.log('Error creating post:', error);
        }
            console.log(5);
            return {
                status: "ok",
            }
            // return post;
        // } catch (error) {
        //     console.error('Error creating post:', error);
        //     console.log(6);
        //     if (!res.headersSent) {
        //         console.log(7);
        //         res.locals.errorCode = 500;
        //         throw new Error('Internal server error');
        //     }
        // }
    })
);

// router.get(
//     '/:id',
//     controllerWrapper(async (req, res) => {
//         try {
//             const postId = req.params.id;
//             const post = await Post.findByPk(postId);
//             const upvotes = await UpvoteDownvote.count({
//                 where: { postId, voteType: 'upvote' },
//             });
//             const downvotes = await UpvoteDownvote.count({
//                 where: { postId, voteType: 'downvote' },
//             });

//             if (!post) {
//                 return res.status(403).json({ message: 'Post not found' });
//             }
//             return res.status(200).json({post, upvotes, downvotes });
//         } catch (error) {
//             console.error('Error fetching post:', error);
//             return res.status(500).json({ message: 'Internal server error' });
//         }
//     })
// );

// router.get(
//     '/posts', 
//     controllerWrapper(async (req: Request, res: Response) => {
//         try {
//             const type = req.body.type;

//             let order: [string, string][] = [];

//             if (type === 'fresh') {
//                 order = [['createdAt', 'DESC']];
//             }
//             // else if (type === 'popular') {
//             //    order = something else
//             // }

//             const posts = await Post.findAll({ order });

//             const postIds = posts.map(post => post.id);

//             const votes = await UpvoteDownvote.findAll({
//                 where: { postId: postIds },
//                 attributes: ['postId', 'voteType', [sequelize.fn('COUNT', 'voteType'), 'count']],
//                 group: ['postId', 'voteType'],
//             });

//             const voteMap: { [key: string]: { upvote: number; downvote: number } } = {};

//             for (const vote of votes) {
//                 const postId = vote.getDataValue('postId');
//                 const voteType = vote.getDataValue('voteType') as 'upvote' | 'downvote';
//                 const count = parseInt(vote.getDataValue('count'));
            
//                 if (!voteMap[postId]) {
//                     voteMap[postId] = { upvote: 0, downvote: 0 };
//                 }
//                 voteMap[postId][voteType] = count;
//             }

//             for (const post of posts) {
//                 const votes = voteMap[post.id] || { upvote: 0, downvote: 0 };
//                 post.dataValues.upvotes = votes.upvote;
//                 post.dataValues.downvotes = votes.downvote;
//             }

//             return res.status(200).json(posts);

//         } catch (error) {
//             console.error('Error fetching posts:', error);
//             return res.status(500).json({ message: 'Internal server error' });
//         }
//     })
// );

export default router;