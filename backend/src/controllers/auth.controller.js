const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const logger = require('../utils/logger');
const crypto = require('crypto');

// Регистрация пользователя
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Проверяем, существует ли пользователь с таким email
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Создаем токен верификации
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Создаем нового пользователя
    user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || 'user',
      verificationToken
    });

    await user.save();

    // Отправляем письмо с верификацией (реализация будет в сервисе отправки email)
    // await sendVerificationEmail(user.email, verificationToken);

    // Не отправляем токен при регистрации, только после верификации email
    res.status(201).json({
      success: true,
      message: 'Регистрация успешна. Пожалуйста, проверьте вашу почту для верификации аккаунта.'
    });
  } catch (error) {
    logger.error(`Ошибка при регистрации: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.' });
  }
};

// Авторизация пользователя
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Находим пользователя по email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Проверяем соответствие пароля
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Проверяем, верифицирован ли email
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Пожалуйста, верифицируйте ваш email перед входом' });
    }

    // Генерируем JWT токен
    const token = user.generateToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    logger.error(`Ошибка при авторизации: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при авторизации. Пожалуйста, попробуйте позже.' });
  }
};

// Запрос на восстановление пароля
exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;

    // Находим пользователя по email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь с таким email не найден' });
    }

    // Генерируем токен для сброса пароля
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Устанавливаем токен и срок его действия (1 час)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 час

    await user.save();

    // Отправляем письмо со ссылкой для сброса пароля (реализация будет в сервисе отправки email)
    // await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      success: true,
      message: 'Инструкция по сбросу пароля отправлена на ваш email.'
    });
  } catch (error) {
    logger.error(`Ошибка при запросе сброса пароля: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка. Пожалуйста, попробуйте позже.' });
  }
};

// Сброс пароля
exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token } = req.params;
    const { password } = req.body;

    // Находим пользователя по токену и проверяем срок действия
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Токен для сброса пароля недействителен или истек' });
    }

    // Устанавливаем новый пароль
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Пароль успешно изменен. Теперь вы можете войти с новым паролем.'
    });
  } catch (error) {
    logger.error(`Ошибка при сбросе пароля: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка. Пожалуйста, попробуйте позже.' });
  }
};

// Верификация email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Находим пользователя по токену верификации
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Недействительный токен верификации' });
    }

    // Обновляем статус верификации
    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Email успешно верифицирован. Теперь вы можете войти в систему.'
    });
  } catch (error) {
    logger.error(`Ошибка при верификации email: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка. Пожалуйста, попробуйте позже.' });
  }
};

// Повторная отправка письма для верификации
exports.resendVerification = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;

    // Находим пользователя по email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь с таким email не найден' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Этот email уже верифицирован' });
    }

    // Генерируем новый токен верификации
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;

    await user.save();

    // Отправляем письмо с верификацией (реализация будет в сервисе отправки email)
    // await sendVerificationEmail(user.email, verificationToken);

    res.json({
      success: true,
      message: 'Новое письмо для верификации отправлено на ваш email.'
    });
  } catch (error) {
    logger.error(`Ошибка при повторной отправке верификации: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка. Пожалуйста, попробуйте позже.' });
  }
};
