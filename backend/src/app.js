const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Загружаем переменные окружения
dotenv.config();

// Импортируем конфигурацию
const { connectDatabase } = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Создаем экземпляр Express
const app = express();
const port = process.env.PORT || 4000;

// Подключаемся к базе данных
connectDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Маршруты
app.use('/api/auth', require('./api/auth.routes'));
app.use('/api/users', require('./api/users.routes'));
app.use('/api/projects', require('./api/projects.routes'));
app.use('/api/funding', require('./api/funding.routes'));
app.use('/api/contractors', require('./api/contractors.routes'));
app.use('/api/discussions', require('./api/discussions.routes'));

// Базовый маршрут для проверки API
app.get('/', (req, res) => {
  res.json({ message: 'CommunityUpgrade API is running' });
});

// Обработка ошибок
app.use(errorHandler);

// 404 обработчик
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Запуск сервера
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

module.exports = app;
