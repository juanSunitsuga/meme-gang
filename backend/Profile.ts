import { Router, Request, Response } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { User } from '../models/User';
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
        const uploadDir = 'uploads/ProfilePictures';
        console.log('Destination directory:', uploadDir);
        if (!fs.existsSync(uploadDir)) {
            console.log('Directory does not exist. Creating:', uploadDir);
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); // Directory to store uploaded files
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        console.log('Generated filename:', filename);
        cb(null, filename);
    },
});
const upload = multer({ storage });

// Endpoint to retrieve a user by ID
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.user ?? {};
        if (!id) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const baseUrl = '.';
        const profilePictureUrl = user.profilePicture
            ? `${baseUrl}${user.profilePicture}`
            : null;

        res.status(200).json({
            id: user.id,
            name: user.name,
            bio: user.bio,
            profilePicture: profilePictureUrl,
        });
    } catch (error) {
        console.error('Error retrieving user profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to update profile
router.put('/edit-profile', authMiddleware, async (req: Request, res: Response) => {
    console.log('Request user:', req.user);
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            return 
        }

        const { id } = req.user;
        const { name, bio } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return 
        }

        user.name = name || user.username;
        user.bio = bio || user.bio;

        await user.save();
        res.status(200).json({ message: 'Profile updated successfully', user });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'An error occurred while updating the profile' });
    }
});

// Endpoint to change password
router.post('/change-password', async (req: Request, res: Response) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return 
    }

    try {
        const decoded = jwt.verify(token, 'meme-gang-lover') as { id: string };

        const user = await User.findOne({ where: { id: decoded.id } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return 
        }

        const isPasswordValid = await bcrypt.compare(req.body.oldPassword, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Old password is incorrect' });
            return 
        }

        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
        return 
    } catch (error) {
        console.error('Error in /change-password route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
        return 
    }
});

// Endpoint to delete profile picture
router.delete('/delete-profile-picture', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.user!;
        const user = await User.findByPk(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return 
        }

        if (!user.profilePicture) {
            res.status(400).json({ message: 'No profile picture to delete' });
            return 
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