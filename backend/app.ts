import express from 'express';
import { Sequelize } from 'sequelize-typescript';
import { Comment } from '../models/Comment';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { SavedPost } from '../models/Saved_Post';
import { Session } from '../models/Session';
import { Tag } from '../models/Tag';
import { UpvoteDownvote } from '../models/Upvote_Downvote_Post';
import profileRoutes from './Profile';
import authRoutes from './RegisterLogin';
import userRoutes from './Profile';
import authMiddleware from '../middleware/Auth';
const config = require('./config/config.json');

const app = express();
app.use(express.json());

const sequelize = new Sequelize({
    ...config.development,
    models: [Comment, Post, User, SavedPost, Session, Tag, UpvoteDownvote],
});

app.use('/auth', authRoutes);

// Apply authMiddleware to routes that require authentication
// app.use(authMiddleware);

app.use('/user', userRoutes);
// app.use('/comments', require('./comments'));
// app.use('/posts', require('./posts'));  

app.listen(3000, async () => {
    await sequelize.sync();
    console.log('Server is running on port 3000');
});