import { Router } from 'express';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { v4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import { CreatedAt } from 'sequelize-typescript';
import { Op } from 'sequelize';

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
        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, 'meme-gang-lover', { expiresIn: '15m' });
        console.log('Generated token:', token);

        await Session.create({
            id: v4(),
            userId: user.id,
            token: token,
            expireAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        });

        res.json({ token });
    } catch (error) {
        console.error('Error in /login route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/session', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log('Token from header:', token);

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, 'meme-gang-lover') as { id: string; email: string };
        console.log('Decoded token:', decoded);

        const session = await Session.findOne({
            where: {
                token: token,
                userId: decoded.id,
                expireAt: { [Op.gt]: new Date() }, // Ensure the token is not expired
            },
        });

        if (!session) {
            console.error('Session not found or expired');
            return res.status(401).json({ message: 'Invalid or expired session' });
        }

        return res.status(200).json({ message: 'Session is valid', userId: decoded.id });
    } catch (error) {
        console.error('Error in /session route:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
});

export default router;