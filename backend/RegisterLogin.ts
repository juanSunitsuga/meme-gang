import { Router } from 'express';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { v4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

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

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        if (password !== user.password) {
            console.log('Invalid password for user:', username);
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, 'meme-gang-lover', { expiresIn: '15m' });

        // Store the token in the Authorization table
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await Session.create({
            userId: user.id,
            token,
            expiresAt
        });

        res.json({ token });
    } catch (error) {
        console.error("Error in /login route:", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;