const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { 
  getProjectComments,
  addComment,
  addReply,
  updateComment,
  deleteComment,
  addProposal,
  getProjectProposals,
  voteForProposal,
  updateProposalStatus
} = require('../controllers/discussions.controller');

// Получить комментарии к проекту
router.get('/comments/project/:projectId', getProjectComments);

// Добавить комментарий к проекту
router.post(
  '/comments/project/:projectId',
  authenticate,
  [
    body('content').notEmpty().withMessage('Комментарий не может быть пустым')
  ],
  addComment
);

// Добавить ответ на комментарий
router.post(
  '/comments/:commentId/reply',
  authenticate,
  [
    body('content').notEmpty().withMessage('Ответ не может быть пустым')
  ],
  addReply
);

// Обновить комментарий
router.put(
  '/comments/:commentId',
  authenticate,
  [
    body('content').notEmpty().withMessage('Комментарий не может быть пустым')
  ],
  updateComment
);

// Удалить комментарий
router.delete(
  '/comments/:commentId',
  authenticate,
  deleteComment
);

// Получить предложения по улучшению проекта
router.get('/proposals/project/:projectId', getProjectProposals);

// Добавить предложение по улучшению проекта
router.post(
  '/proposals/project/:projectId',
  authenticate,
  [
    body('title').notEmpty().withMessage('Введите заголовок предложения'),
    body('content').notEmpty().withMessage('Введите описание предложения'),
    body('category').isIn(['safety', 'comfort', 'budget', 'alternative', 'other'])
      .withMessage('Выберите допустимую категорию')
  ],
  addProposal
);

// Голосовать за предложение
router.post(
  '/proposals/:proposalId/vote',
  authenticate,
  voteForProposal
);

// Обновить статус предложения (только для администраторов)
router.put(
  '/proposals/:proposalId/status',
  authenticate,
  updateProposalStatus
);

module.exports = router;
