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

app.put('/edit-post/:id', async (req, res) => {
    const { id } = req.params;
    const { title, image_url } = req.body;

    try {
        const post = await Post.findByPk(id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        post.title = title;
        post.image_url = image_url;
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update post' });
    }
});