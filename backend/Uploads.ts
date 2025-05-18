import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware from '../middleware/Auth';
import { User } from '../models/User';
import { controllerWrapper } from '../utils/controllerWrapper';

const router = express.Router();

// Ensure upload directories exist
const createDirIfNotExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Define upload paths relative to project root
const avatarUploadDir = './uploads/avatars';
const postUploadDir = './uploads/posts';

console.log('Avatar upload directory:', avatarUploadDir);
console.log('Post upload directory:', postUploadDir);

createDirIfNotExists(avatarUploadDir);
createDirIfNotExists(postUploadDir);

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, avatarUploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + uuidv4().substring(0, 8);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure storage for post images
const postStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, postUploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + uuidv4().substring(0, 8);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow image uploads
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and GIF files are allowed.'));
    }
};

// Set up multer for avatar uploads (10MB max)
const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter
}).single('profilePicture');

// Set up multer for post image uploads (20MB max)
const uploadPostImage = multer({
    storage: postStorage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: fileFilter
}).single('postImage');

// Avatar upload route
router.post('/avatar', authMiddleware, (req, res) => {
    console.log('Avatar upload request received');
    
    uploadAvatar(req, res, async (err) => {
        console.log('Processing avatar upload', req.file);
        
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            if (!req.user) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            
            const { id } = req.user;
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Store the path without domain
            const profilePicturePath = req.file.filename;
            
            // Update user's profile picture in database
            user.profilePicture = profilePicturePath;
            await user.save();

            res.status(200).json({
                message: 'Profile picture uploaded successfully',
                profilePicture: profilePicturePath
            });
        } catch (error) {
            console.error('Error updating profile picture:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
});

// Post image upload route
router.post('/post-image', authMiddleware, (req, res) => {
    uploadPostImage(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            const postImagePath = `/uploads/posts/${req.file.filename}`;
            
            res.status(200).json({
                message: 'Post image uploaded successfully',
                postImage: postImagePath
            });
        } catch (error) {
            console.error('Error uploading post image:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
});

// Helper function to determine content type
const getContentType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg'; // Default
};

// Serve avatar images
router.get('/avatars/:filename', controllerWrapper(async (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(process.cwd(), 'uploads', 'avatars', filename);
  
  if (!fs.existsSync(imagePath)) {
    return {
      status: 404,
      message: 'Avatar not found'
    };
  }
  
  try {
    const buffer = fs.readFileSync(imagePath);
    const contentType = getContentType(filename);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for a day
    res.status(200).send(buffer);
    return null; // Signal that we've handled the response directly
  } catch (error) {
    console.error('Error serving avatar image:', error);
    return {
      status: 500,
      message: 'Error serving image'
    };
  }
}));

// Serve post images
router.get('/posts/:filename', controllerWrapper(async (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(process.cwd(), 'uploads', 'posts', filename);
  
  if (!fs.existsSync(imagePath)) {
    return {
      status: 404,
      message: 'Post image not found'
    };
  }
  
  try {
    const buffer = fs.readFileSync(imagePath);
    const contentType = getContentType(filename);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(buffer);
    return null;
  } catch (error) {
    console.error('Error serving post image:', error);
    return {
      status: 500,
      message: 'Error serving image'
    };
  }
}));

export default router;