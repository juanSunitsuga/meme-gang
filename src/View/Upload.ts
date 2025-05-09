import express from 'express';
import multer from 'multer';
import { User } from '../models/User';
import { Post } from '../models/Post';
import fileConfig from './utils/FileConfig';
import authenticate from '../middleware/authenticate';

const router = express.Router();

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // The directory will be created if it doesn't exist
    fileConfig.ensureDirectoriesExist();
    cb(null, fileConfig.getAvatarFilePath('').replace(/[^/\\]+$/, ''));
  },
  filename: (req, file, cb) => {
    cb(null, fileConfig.generateUniqueFilename(file.originalname));
  }
});

// Configure multer for post uploads
const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // The directory will be created if it doesn't exist
    fileConfig.ensureDirectoriesExist();
    cb(null, fileConfig.getPostFilePath('').replace(/[^/\\]+$/, ''));
  },
  filename: (req, file, cb) => {
    cb(null, fileConfig.generateUniqueFilename(file.originalname));
  }
});

// Create multer upload instances
const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any);
    }
  }
});

const uploadPostImage = multer({ 
  storage: postStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any);
    }
  }
});

// Route to upload avatar
router.post('/avatar', authenticate, uploadAvatar.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get the user from the authenticated request
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the URL for the uploaded avatar
    const avatarUrl = fileConfig.getAvatarUrl(req.file.filename);

    // Update the user's profile picture
    await user.update({ profilePicture: avatarUrl });

    return res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePicture: avatarUrl
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return res.status(500).json({ message: 'Error uploading file' });
  }
});

// Route to upload post image
router.post('/post-image', authenticate, uploadPostImage.single('postImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get the URL for the uploaded post image
    const imageUrl = fileConfig.getPostImageUrl(req.file.filename);

    return res.status(200).json({
      message: 'Post image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading post image:', error);
    return res.status(500).json({ message: 'Error uploading file' });
  }
});

// Serve files statically (this might be handled in app.ts instead)
// This is just for reference

export default router;