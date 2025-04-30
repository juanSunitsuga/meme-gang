import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { User } from '../../models/User';
import { addSession } from '../../middleware/Auth';
const JWT_SECRET = process.env.JWT_SECRET!;

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    // Find the user and verify password (you implement this)
    const user = await User.findOne({ where: { username } });
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '15m' });

    // Save the session in the database
    await addSession(user.id, token);

    res.json({ token }); // Send token back to the client
};
