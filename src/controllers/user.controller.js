import User from '../models/user.model.js';
import Article from "../models/article.model.js";
import mongoose from "mongoose";

export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({});
        if (!users) {
            return res.status(404).json({message: 'Not found users'});
        }
        if (req.query.sortByAge) {
            users.sort((a, b) => b.age - a.age);
        }
        res.status(200).json(users.map((user) => {
            return {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                age: user.age,
            };
        }));
    } catch (err) {
        next(err);
    }
}

export const getUserByIdWithArticles = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const articles = await Article.find({owner: new mongoose.Types.ObjectId(req.params.id)}).select('-_id title subtitle createdAt');
        if (!user) {
            return res.status(404).json({message: 'Not found user'});
        }
        res.status(200).json({user, articles});
    } catch (err) {
        next(err);
    }
}


export const createUser = async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        const validationError = user.validateSync();
        if (validationError) {
            console.log(validationError);
            const errorMessages = {};
            Object.keys(validationError.errors).forEach((field) => {
                errorMessages[field] = validationError.errors[field].message;
            });
            return res.status(400).json({errors: errorMessages});
        }
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
}

export const updateUserById = async (req, res, next) => {
    try {
        const user = await User.findOne({_id: req.params.id});
        const validationError = user.validateSync(); // validate the document
        if (!user) {
            return res.status(404).json({message: 'Not found user'});
        }

        if (validationError) {
            const errorMessages = {};
            Object.keys(validationError.errors).forEach((field) => {
                errorMessages[field] = validationError.errors[field].message;
            });
            return res.status(400).json({errors: errorMessages});
        }
        Object.assign(user, req.body);
        await user.save();
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
}

export const deleteUserById = async (req, res, next) => {
    try {
        const user = await User.findOne({_id: req.params.id});

        if (!user) {
            return res.status(404).json({message: 'Not found user'});
        }

        const deletedUser = await User.deleteOne({_id: req.params.id});

        await Article.deleteMany({owner: new mongoose.Types.ObjectId(req.params.id)});

        res.status(200).json(deletedUser);
    } catch (err) {
        next(err);
    }
}

// Create post handler to like an article
export const likeArticle = async (req, res, next) => {
    try {
        // const article = await Article.findById(req.params.articleId);
        // if (!article) {
        //     return res.status(404).json({message: 'Not found article'});
        // }
        // article.likes += 1;
        // await article.save();
        // res.status(200).json(article);

        // Firstly, find the article and update the likes in article,but don't forget to update user's likedArticles
        // Secondly, find the user and update the likedArticles
        const article = await Article.findById(req.params.articleId);
        if (!article) {
            return res.status(404).json({message: 'Not found article'});
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({message: 'Not found user'});
        }
        article.likes.push(user._id);
        await article.save();
        // Find the user and update the likedArticles

        user.likedArticles.push(article._id);
        await user.save();
        res.status(200).json(article);
    } catch (err) {
        next(err);
    }
}

// Create handler to remove like from an article
export const removeLikeFromArticle = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.articleId);
        if (!article) {
            return res.status(404).json({message: 'Not found article'});
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({message: 'Not found user'});
        }
        //article.likes.push(user._id);
        // remove the user from the likes array
        article.likes = article.likes.filter((like) => {
            return like.toString() !== user._id.toString();
        });
        await article.save();
        // Find the user and update the likedArticles
        user.likedArticles = user.likedArticles.filter((likedArticle) => {
            return likedArticle.toString() !== article._id.toString();
        });
        await user.save();
        res.status(200).json(article);
    } catch (err) {
        next(err);
    }
}
