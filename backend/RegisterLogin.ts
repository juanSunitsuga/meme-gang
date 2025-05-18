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
        return {
            status: 400,
            message: 'Username, password, and email are required'
        };
    }

    try {
        const existingUser = await User.findOne({ where: { username } });
        const existingEmail = await User.findOne({ where: { email } });

        if (existingUser) {
            return {
                status: 400,
                message: 'Username already exists'
            };
        }

        if (existingEmail) {
            return {
                status: 400,
                message: 'Email already exists'
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            id: v4(),
            username,
            password: hashedPassword,
            email,
        });

        return {
            status: 201,
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            }
        };
    } catch (error) {
        console.error("Error in /register route:", error);
        return {
            status: 500,
            message: 'Internal Server Error'
        };
    }
}));

router.post('/login', controllerWrapper(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find the user
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return {
                status: 401,
                message: 'Invalid credentials'
            };
        }

        // Calculate token expiration time for client reference
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Match JWT_EXPIRATION

        // Generate JWT token with user data
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                name: user.name || user.username 
            }, appConfig.jwtSecret, { expiresIn: appConfig.jwtExpiration }
        )

        // Return token and user info to the client
        return {
            status: 200,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name || user.username
            },
            expiresAt: expiresAt.toISOString()
        };
    } catch (error) {
        console.error('Error in login route:', error);
        return {
            status: 500,
            message: 'Internal server error'
        };
    }
}));

router.get('/session', controllerWrapper(async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return {
            status: 401,
            message: 'No token provided'
        };
    }

    try {
        // Verify the JWT token - this checks both signature and expiration
        const decoded = jwt.verify(token, appConfig.jwtSecret) as {
            id: string;
            email: string;
            name?: string;
        };

        // Get fresh user data from database
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'email', 'name', 'profilePicture', 'username']
        });

        if (!user) {
            return {
                status: 404,
                message: 'User not found'
            };
        }

        return {
            status: 200,
            message: 'Session is valid',
            user
        };
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            if (error instanceof jwt.TokenExpiredError) {
                return {
                    status: 401,
                    message: 'Token expired'
                };
            }

            return {
                status: 401,
                message: 'Invalid token'
            };
        }

        console.error('JWT verify error:', error);
        return {
            status: 500,
            message: 'Internal server error'
        };
    }
}));

router.post('/logout', controllerWrapper(async (req, res) => {
    return {
        status: 200,
        message: 'Logged out successfully'
    };
}));

export default router;