import { Request, Response } from 'express';

// Extend the Request interface to include the file
declare global {
    namespace Express {
        interface Request {
            file?: {
                filename: string;
            };
        }
    }
}
import { User } from '../../models/User';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = 'meme-gang-lover'; // Use environment variables for production

export const uploadProfilePicture = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access token is missing or invalid' });
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (!decoded) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Save the file path to the user's profilePicture field
        const profilePicturePath = `/uploads/${req.file.filename}`;
        user.profilePicture = profilePicturePath;
        await user.save();

        res.status(200).json({ message: 'Profile picture uploaded successfully', profilePicture: profilePicturePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while uploading the profile picture' });
    }
};

export const deleteProfilePicture = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access token is missing or invalid' });
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (!decoded) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        const user = await User.findByPk(decoded.id);
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
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the profile picture' });
    }
};