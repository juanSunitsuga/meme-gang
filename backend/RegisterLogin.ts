import { Router } from 'express';
import { User } from '../models/User';
import { v4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import { controllerWrapper } from '../utils/controllerWrapper';
import { appConfig } from '../config/app';

const router = Router();

router.use(bodyParser.json());

router.post('/register', controllerWrapper(async (req, res, next) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        throw new Error('Username, password, and email are required');
    }

    const existingUser = await User.findOne({ where: { username } });
    const existingEmail = await User.findOne({ where: { email } });

    if (existingUser) {
        throw new Error('Username already exists');
    }

    if (existingEmail) {
        throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        id: v4(),
        username,
        password: hashedPassword,
        email,
    });

    return {
        message: 'User registered successfully',
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
        }
    };
}));

router.post('/login', controllerWrapper(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Generate JWT token with user data
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name || user.username
        },
        appConfig.jwtSecret,
        { expiresIn: appConfig.jwtExpiration }
    );

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name || user.username
        },
        expiresAt: expiresAt.toISOString()
    };
}));

router.get('/session', controllerWrapper(async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        throw new Error('No token provided');
    }

    // Verify the JWT token - this checks both signature and expiration
    const decoded = jwt.verify(token, appConfig.jwtSecret) as {
        id: string;
        email: string;
        name?: string;
    };

    const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'email', 'name', 'profilePicture', 'username']
    });

    if (!user) {
        throw new Error('User not found');
    }

    return {
        message: 'Session is valid',
        user
    };

}));

router.post('/logout', controllerWrapper(async (req, res) => {
    return {
        message: 'Logged out successfully'
    };
}));

export default router;