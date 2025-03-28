const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`);
  
  // Определяем статус ошибки
  const statusCode = err.statusCode || 500;
  
  // Отправляем ответ с ошибкой
  res.status(statusCode).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    }
  });
};

module.exports = errorHandler;
