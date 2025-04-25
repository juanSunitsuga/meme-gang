import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../../models/User';
import { Session } from '../../models/Session';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'meme-gang-lover';

export const changePassword = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access token is missing or invalid' });
        }

        // Verify the token
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (!decoded) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        // Check if the session is active
        const session = await Session.findOne({ where: { token } });
        if (!session) {
            return res.status(403).json({ message: 'User session is invalid or expired' });
        }

        // Get the user from the database
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract old password, new password, and confirm password from the request body
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validate old password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        // Invalidate the current session by deleting it
        await Session.destroy({ where: { token } });

        // Respond with success
        res.status(200).json({ message: 'Password changed successfully. Please log in again.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while changing the password' });
    }
};