const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getNearbyProjects,
  addStageToProject,
  getProjectStages,
  updateProjectStage,
  deleteProjectStage,
  getProjectContributors
} = require('../controllers/projects.controller');

// Получить все проекты с фильтрацией
router.get('/', getProjects);

// Получить проект по ID
router.get('/:id', getProjectById);

// Получить проекты рядом с заданной локацией
router.get('/nearby', getNearbyProjects);

// Создать проект (только для администраторов сообщества и главных администраторов)
router.post(
  '/',
  authenticate,
  authorize('communityAdmin', 'admin'),
  [
    body('title').notEmpty().withMessage('Введите название проекта'),
    body('description').notEmpty().withMessage('Введите описание проекта'),
    body('category').isIn(['park', 'playground', 'sport', 'infrastructure', 'green', 'other'])
      .withMessage('Выберите допустимую категорию'),
    body('location').notEmpty().withMessage('Укажите расположение проекта'),
    body('totalBudget').isNumeric().withMessage('Введите корректный бюджет')
  ],
  createProject
);

// Обновить проект (только для создателя и администраторов)
router.put(
  '/:id',
  authenticate,
  authorize('communityAdmin', 'admin'),
  updateProject
);

// Удалить проект (только для создателя и администраторов)
router.delete(
  '/:id',
  authenticate,
  authorize('communityAdmin', 'admin'),
  deleteProject
);

// Добавить этап к проекту
router.post(
  '/:id/stages',
  authenticate,
  authorize('communityAdmin', 'admin'),
  [
    body('name').notEmpty().withMessage('Введите название этапа'),
    body('description').notEmpty().withMessage('Введите описание этапа'),
    body('budget').isNumeric().withMessage('Введите корректный бюджет этапа')
  ],
  addStageToProject
);

// Получить все этапы проекта
router.get('/:id/stages', getProjectStages);

// Обновить этап проекта
router.put(
  '/:id/stages/:stageId',
  authenticate,
  authorize('communityAdmin', 'admin'),
  updateProjectStage
);

// Удалить этап проекта
router.delete(
  '/:id/stages/:stageId',
  authenticate,
  authorize('communityAdmin', 'admin'),
  deleteProjectStage
);

// Получить всех контрибьюторов проекта
router.get('/:id/contributors', getProjectContributors);

module.exports = router;
