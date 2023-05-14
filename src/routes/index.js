import { Router } from 'express';
import usersRouter from './user.router.js';
import articleRouter from './article.router.js';

const router = Router();

router.use('/users', usersRouter);
router.use('/articles', articleRouter);

export default router;