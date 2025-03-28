const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { 
  contributeToProject,
  contributeToStage,
  getUserContributions,
  getProjectFundingStats
} = require('../controllers/funding.controller');

// Внести средства на проект
router.post(
  '/project/:projectId',
  authenticate,
  [
    body('amount').isNumeric().withMessage('Введите корректную сумму'),
    body('anonymous').isBoolean().optional().withMessage('Используйте true/false для анонимности')
  ],
  contributeToProject
);

// Внести средства на конкретный этап проекта
router.post(
  '/stage/:stageId',
  authenticate,
  [
    body('amount').isNumeric().withMessage('Введите корректную сумму'),
    body('anonymous').isBoolean().optional().withMessage('Используйте true/false для анонимности')
  ],
  contributeToStage
);

// Получить все взносы пользователя
router.get('/user/contributions', authenticate, getUserContributions);

// Получить статистику финансирования проекта
router.get('/project/:projectId/stats', getProjectFundingStats);

module.exports = router;
