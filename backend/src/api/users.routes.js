const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getUserProfile,
  updateUserProfile,
  getUserBadges,
  getUserStatistics,
  uploadAvatar
} = require('../controllers/users.controller');

// Получить профиль пользователя
router.get('/profile', authenticate, getUserProfile);

// Обновить профиль пользователя
router.put('/profile', authenticate, updateUserProfile);

// Загрузить аватар
router.post('/avatar', authenticate, uploadAvatar);

// Получить значки пользователя
router.get('/badges', authenticate, getUserBadges);

// Получить статистику пользователя
router.get('/statistics', authenticate, getUserStatistics);

module.exports = router;
