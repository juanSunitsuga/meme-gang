import express from 'express'
import { Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../../../models/User';
import { authenticateToken } from '../../../middleware/Auth';

const app = express()
app.use(express.json())

const config = require('./config/config.json');
const sequelize = new Sequelize({
    ...config.development,
    models: [User]
})

app.use('/edit-profile', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user; // Assuming `authenticateToken` adds `user` to `req`
        const { username, email } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return next();
        }

        user.username = username || user.username;
        user.email = email || user.email;
        

        await user.save();
        res.status(200).json({ message: 'Profile updated successfully', user });
        return next();
    } catch (error) {
        next(error);
    }
});