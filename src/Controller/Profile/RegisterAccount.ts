import express from 'express'
import { Sequelize } from 'sequelize-typescript';
// npm i --save-dev @types/bcrypt
import bcrypt from 'bcrypt';
import { User } from '../../../models/User';
const config = require('./config/config.json');

const app = express()
app.use(express.json())

const sequelize = new Sequelize({
    ...config.development,
    models: [User]
})

app.post('/register', async (req, res, next) => {
    const { username, email, password } = req.body

    // Password Hashing
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const user = await User.create({ username, email, hashedPassword })
        res.status(201).json(user)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create profile' })
    };
    next();
})
