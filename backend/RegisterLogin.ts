import { Router } from 'express';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { v4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import { appConfig } from '../config/app';

const router = Router();

router.use(bodyParser.json());

router.post('/register', async (req, res, next) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Username, password, and email are required' });
    }

    try {
        const existingUser = await User.findOne({ where: { username } });
        const existingEmail = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            id: v4(),
            username,
            password: hashedPassword,
            email,
        });

        return res.status(201).json(newUser);
    } catch (error) {
        console.error("Error in /register route:", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find the user
        const user = await User.findOne({ where: { email } });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            'meme-gang-lover', 
            { expiresIn: '1h' } // Longer expiration time for JWT
        );
        
        // Create session with a 30-minute expiration time
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);
        
        // Check for existing session
        const existingSession = await Session.findOne({
            where: { userId: user.id }
        });
        
        if (existingSession) {
            // Update existing session
            await existingSession.update({
                token: token,
                expireAt: expiresAt
            });
        } else {
            // Create new session
            await Session.create({
                id: v4(),
                userId: user.id,
                token: token,
                expireAt: expiresAt
            });
        }
        
        res.status(200).json({ 
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            expiresAt: expiresAt.toISOString()
        });
    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/session', async (req, res) => {
    // Add logging to debug token processing
    const authHeader = req.headers['authorization'];
    console.log('Received auth header:', authHeader);
    
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // 1. Verify the JWT token
        const decoded = jwt.verify(token, 'meme-gang-lover') as { id: string; email: string };
        
        // 2. Find session in database
        const session = await Session.findOne({
            where: {
                token: token,
                userId: decoded.id,
                // Ensure expireAt is compared correctly
                expireAt: {
                    [Op.gt]: new Date() // MUST be greater than current time
                }
            },
            // Debug log
            logging: console.log
        });
        
        console.log('Session found:', !!session, 'for userId:', decoded.id);
        
        if (!session) {
            return res.status(401).json({ message: 'Invalid or expired session' });
        }
        
        // Update session's expireAt to extend it (optional)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);
        await session.update({ expireAt: expiresAt });
        
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'email', 'name', 'profilePicture']
        });
        
        return res.status(200).json({ 
            message: 'Session is valid',
            user
        });
    } catch (error) {
        console.error('JWT verify error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
});

router.post('/logout', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const session = await Session.findOne({ where: { token } });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        session.expireAt = new Date();
        await session.save();

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error in /logout route:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;