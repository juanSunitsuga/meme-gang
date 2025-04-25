import express from 'express'
import { Sequelize } from 'sequelize-typescript';
import { User } from '../../models/User';
const config = require('./config/config.json');

const app = express()
app.use(express.json())

const sequelize = new Sequelize({
    ...config.development,
    models: [User]
})