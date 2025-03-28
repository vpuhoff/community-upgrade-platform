const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  verifyEmail,
  resendVerification
} = require('../controllers/auth.controller');

// Регистрация пользователя
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
    body('firstName').notEmpty().withMessage('Введите имя'),
    body('lastName').notEmpty().withMessage('Введите фамилию')
  ],
  register
);

// Авторизация пользователя
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').notEmpty().withMessage('Введите пароль')
  ],
  login
);

// Запрос на восстановление пароля
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Введите корректный email')
  ],
  forgotPassword
);

// Сброс пароля
router.post(
  '/reset-password/:token',
  [
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов')
  ],
  resetPassword
);

// Верификация email
router.get('/verify-email/:token', verifyEmail);

// Повторная отправка письма для верификации
router.post(
  '/resend-verification',
  [
    body('email').isEmail().withMessage('Введите корректный email')
  ],
  resendVerification
);

module.exports = router;
