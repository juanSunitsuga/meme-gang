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
import registerLoginRoutes from './RegisterLogin';
import uploadRoutes from './Uploads';
import commentsRoutes from './Comments';
import commentReplyRoutes from './CommentsReply';
import searchRoutes from './Search';
import config from '../config/config.json';
import cors from 'cors';
import error from '../middleware/errorHandler';
import path from 'path';
import postRouter from './post';

const app = express();

// Enable CORS with credentials
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}));

app.use(express.json());

import { Dialect } from 'sequelize'; // Add this import if not already present

const sequelize = new Sequelize({
    ...config.development,
    dialect: config.development.dialect as Dialect, // Cast dialect to Dialect type
    models: [Comment, Post, User, SavedPost, Session, Tag, UpvoteDownvote],
});


// Later using the same path for API routes
app.use('/uploads', uploadRoutes);
app.use('/uploads/posts', express.static('uploads/post'));


app.use(error)
app.use('/auth', registerLoginRoutes);
app.use('/profile', profileRoutes);

app.use('/api', searchRoutes);
app.use('/post', postRouter);
app.use('/post/:id/comments', commentsRoutes); 
app.use('/comments/:id/replies', commentReplyRoutes); 
app.use(error)

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(3000, async () => {
    await sequelize.sync();
    console.log('Server is running on port 3000');
});