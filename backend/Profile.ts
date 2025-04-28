import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import authMiddleware from '../middleware/Auth';


const JWT_SECRET = 'meme-gang-lover'; // Use environment variables for production

const config = require('./config/config.json');
const sequelize = new Sequelize({
    ...config.development,
    models: [User],
});

declare global {
    namespace Express {
        interface Request {
            user?: { id: string };
            uploadedFile?: { filename: string };
        }
    }
}

const router = Router();
router.use(bodyParser.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });



// Endpoint to get user profile
router.get('/search', async (req: Request, res: Response) => {
    try {
        const { username, email } = req.query;

        let whereClause: any = {};

        if (username) {
            whereClause.username = { [Op.iLike]: `%${username}%` }; // Case-insensitive search for username
        }

        const users = await User.findAll({ where: whereClause });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching for users:', error);
        res.status(500).json({ message: 'An error occurred while searching for users' });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user by ID:', error);
        res.status(500).json({ message: 'An error occurred while retrieving the user' });
    }
});

// Endpoint to update profile
router.post('/edit-profile', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user!;
        const { displayName, bio } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = displayName || user.username;
        user.bio = bio || user.bio;

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        next(error);
    }
});

// Endpoint to change password
router.post('/change-password', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.user!;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'An error occurred while changing the password' });
    }
});

// Endpoint to upload profile picture
router.post('/upload-profile-picture', authMiddleware, upload.single('profilePicture'), async (req: Request, res: Response) => {
    try {
        const { id } = req.user!;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!req.uploadedFile) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const profilePicturePath = `/uploads/${req.uploadedFile.filename}`;
        user.profilePicture = profilePicturePath;
        await user.save();

        res.status(200).json({ message: 'Profile picture uploaded successfully', profilePicture: profilePicturePath });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ message: 'An error occurred while uploading the profile picture' });
    }
});

// Endpoint to delete profile picture
router.delete('/delete-profile-picture', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.user!;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.profilePicture) {
            return res.status(400).json({ message: 'No profile picture to delete' });
        }

        const filePath = path.join(__dirname, '../../public', user.profilePicture);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        user.profilePicture = undefined;
        await user.save();

        res.status(200).json({ message: 'Profile picture deleted successfully' });
    } catch (error) {
        console.error('Error deleting profile picture:', error);
        res.status(500).json({ message: 'An error occurred while deleting the profile picture' });
    }
});

export default router;