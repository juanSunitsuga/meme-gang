import { Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import authMiddleware from '../middleware/Auth';
import jwt from 'jsonwebtoken';

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

// Endpoint to retrieve a user by ID
router.get('/me', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    try {
        const decoded = jwt.verify(token, 'meme-gang-lover') as { id: string };

        const user = await User.findOne({
            where: { id: decoded.id },
            attributes: ['username', 'email', 'profilePicture', 'name', 'bio'],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error retrieving user profile:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
});

// Endpoint to update profile
router.put('/edit-profile', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    console.log('Request user:', req.user);
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
router.post('/change-password', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, 'meme-gang-lover') as { id: string };

        const user = await User.findOne({ where: { id: decoded.id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(req.body.oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error in /change-password route:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
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