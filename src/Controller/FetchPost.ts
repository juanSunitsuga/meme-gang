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

app.get("/post", async (req, res) => {
    const { searchType } = req.body;
    let where: any = {};

    
});