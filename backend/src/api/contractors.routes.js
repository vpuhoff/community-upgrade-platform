const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getContractors,
  getContractorProfile,
  updateContractorProfile,
  applyForStage,
  getStageApplications,
  voteForContractor,
  getContractorProjects
} = require('../controllers/contractors.controller');

// Получить всех подрядчиков
router.get('/', getContractors);

// Получить профиль подрядчика
router.get('/:id', getContractorProfile);

// Обновить профиль подрядчика (только для самого подрядчика)
router.put(
  '/profile',
  authenticate,
  authorize('contractor'),
  updateContractorProfile
);

// Подать заявку на этап проекта (только для подрядчиков)
router.post(
  '/apply/stage/:stageId',
  authenticate,
  authorize('contractor'),
  [
    body('price').isNumeric().withMessage('Введите корректную сумму'),
    body('description').notEmpty().withMessage('Введите описание предложения'),
    body('estimatedTime').isNumeric().withMessagse('Введите оценку времени в днях')
  ],
  applyForStage
);

// Получить все заявки на этап проекта
router.get('/applications/stage/:stageId', getStageApplications);

// Проголосовать за подрядчика (только для авторизованных пользователей)
router.post(
  '/vote/stage/:stageId/application/:applicationId',
  authenticate,
  voteForContractor
);

