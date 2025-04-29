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
import registerLoginRoutes from './RegisterLogin';
import authMiddleware from '../middleware/Auth';
import config from '../config/config.json';
import cors from 'cors';

const app = express();

// Enable CORS
app.use(cors({
    origin: 'http://localhost:5173', // Allow only this origin
}));

app.use(express.json());

const sequelize = new Sequelize({
    ...config.development,
    models: [Comment, Post, User, SavedPost, Session, Tag, UpvoteDownvote],
});

app.use('/auth', registerLoginRoutes);
app.use('/profile', profileRoutes);

app.listen(3000, async () => {
    await sequelize.sync();
    console.log('Server is running on port 3000');
});