import { Router } from 'express';
import {
  createUser,
  getUsers,
  updateUserById,
  deleteUserById,
  getUserByIdWithArticles, likeArticle, removeLikeFromArticle,
} from '../controllers/user.controller.js';

const userRouter = Router();

userRouter
  .get('/', getUsers)
  .get('/:id', getUserByIdWithArticles)
  .post('/', createUser)
  .put('/:id', updateUserById)
    .put('/:id/:articleId', likeArticle)
    .delete('/:id/:articleId', removeLikeFromArticle)
  .delete('/:id', deleteUserById);

export default userRouter;
