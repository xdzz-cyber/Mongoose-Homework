import Article from '../models/article.model.js';
import User from "../models/user.model.js";


export const getArticles = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const articles = await Article.find({title: {$regex: req.query.title || '', $options: 'i'}})
            .populate('owner', '-_id fullName email age').sort({createdAt: -1}).skip(skip).limit(limit);
        if (!articles) {
            return res.status(404).json({message: 'Not found articles'});
        }
        res.status(200).json(articles);
    } catch (err) {
        next(err);
    }
}

export const getArticleById = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.id).populate('owner', 'fullName email age');
        if (!article) {
            return res.status(404).json({message: 'Not found article'});
        }
        res.status(200).json(article);
    } catch (err) {
        next(err);
    }
}

export const createArticle = async (req, res, next) => {
    try {
        const article = new Article(req.body);
        const validationError = article.validateSync();
        if (validationError) {
            const errorMessages = {};
            Object.keys(validationError.errors).forEach((field) => {
                errorMessages[field] = validationError.errors[field].message;
            });
            return res.status(400).json({errors: errorMessages});
        }
        const owner = await User.findById(article.owner);
        if (!owner) {
            return res.status(404).json({message: 'Owner not found'});
        }
        owner.numberOfArticles += 1;
        await owner.save();
        await article.save();

        res.status(201).json(article);
    } catch (err) {
        next(err);
    }
};

export const updateArticleById = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({message: 'Not found article'});
        }

        Object.assign(article, req.body);

        const validationError = article.validateSync(); // validate the document
        if (validationError) {
            console.log(validationError);
            const errorMessages = {};
            Object.keys(validationError.errors).forEach((field) => {
                errorMessages[field] = validationError.errors[field].message;
            });
            return res.status(400).json({errors: errorMessages});
        }

        if (article.owner.toString() !== req.params.userId) {
            return res.status(404).json({message: 'Only specific user can update current document'});
        }

        await article.save();
        res.status(200).json(article);
    } catch (err) {
        next(err);
    }
};

export const deleteArticleById = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({message: 'Not found article'});
        }

        const owner = await User.findById(article.owner);
        owner.numberOfArticles -= 1;
        await owner.save();
        await Article.deleteOne({_id: req.params.id});
        res.status(200).json({message: 'Article deleted successfully'});
    } catch (err) {
        next(err);
    }
}
