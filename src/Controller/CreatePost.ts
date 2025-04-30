import { Sequelize } from "sequelize-typescript";
import { Post } from "../../models/Post";
import express from "express";

const config = require("../config/config.json");

const sequelize = new Sequelize({
    ...config.development,
    models: [Post]
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/create-post', async (req, res, next) => {
    const { title, img_url} = req.body;

    try {
        const post = await Post.create({ title, img_url, userId });
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});