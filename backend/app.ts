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
import commentsRoutes from './Comments';
import commentReplyRoutes from './CommentsReply';
import searchRoutes from './Search';
import config from '../config/config.json';
import cors from 'cors';
import error from '../middleware/errorHandler';

const app = express();

// Enable CORS with credentials
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}));

app.use(express.json());

const sequelize = new Sequelize({
    ...config.development,
    models: [Comment, Post, User, SavedPost, Session, Tag, UpvoteDownvote],
});

app.use('/auth', registerLoginRoutes);
app.use(error)
app.use('/profile', profileRoutes);
<<<<<<< HEAD
app.use('/uploads',)
app.use('/api', searchRoutes);
=======
app.use('/post/:postId/comments', commentsRoutes); 
app.use('/comments/:commentsId/replies', commentReplyRoutes); 
>>>>>>> 596818f9673390bb8e659a5cff746e52e34e5edf

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(3000, async () => {
    await sequelize.sync();
    console.log('Server is running on port 3000');
});