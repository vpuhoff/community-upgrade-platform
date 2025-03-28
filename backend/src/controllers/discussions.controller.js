const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Comment = require('../models/comment.model');
const Proposal = require('../models/proposal.model');
const Project = require('../models/project.model');
const logger = require('../utils/logger');

// Получить комментарии к проекту
exports.getProjectComments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sort = 'newest', page = 1, limit = 20 } = req.query;

    // Получаем проект, чтобы проверить его существование
    const projectExists = await Project.exists({ _id: projectId });
    if (!projectExists) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    // Определяем сортировку
    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'popular':
        sortOptions = { upvotes: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Считаем общее количество корневых комментариев для пагинации
    const totalComments = await Comment.countDocuments({
      project: projectId,
      parentComment: null
    });

    // Получаем корневые комментарии с пагинацией
    const comments = await Comment.find({
      project: projectId,
      parentComment: null
    })
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'firstName lastName avatar'
        }
      });

    res.json({
      success: true,
      data: comments,
      pagination: {
        total: totalComments,
        page: parseInt(page),
        pages: Math.ceil(totalComments / limit)
      }
    });
  } catch (error) {
    logger.error(`Ошибка при получении комментариев к проекту: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при получении комментариев' });
  }
};

// Добавить комментарий к проекту
exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId } = req.params;
    const { content, attachments } = req.body;

    // Проверяем существование проекта
    const projectExists = await Project.exists({ _id: projectId });
    if (!projectExists) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    // Создаем новый комментарий
    const comment = new Comment({
      content,
      author: req.user.id,
      project: projectId,
      attachments: attachments || []
    });

    await comment.save();

    // Возвращаем комментарий с данными автора
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    logger.error(`Ошибка при добавлении комментария: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при добавлении комментария' });
  }
};

// Добавить ответ на комментарий
exports.addReply = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { commentId } = req.params;
    const { content, attachments } = req.body;

    // Находим родительский комментарий
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    // Создаем новый комментарий-ответ
    const reply = new Comment({
      content,
      author: req.user.id,
      project: parentComment.project,
      parentComment: commentId,
      attachments: attachments || []
    });

    await reply.save();

    // Добавляем ответ в список ответов родительского комментария
    parentComment.replies.push(reply._id);
    await parentComment.save();

    // Возвращаем ответ с данными автора
    const populatedReply = await Comment.findById(reply._id)
      .populate('author', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      data: populatedReply
    });#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Создание структуры бэкенда для проекта CommunityUpgrade...${NC}"

# Создание базовой директории проекта
mkdir -p community-upgrade-backend
cd community-upgrade-backend

# Инициализация Git репозитория
git init
echo -e "${GREEN}Git репозиторий инициализирован${NC}"

# Создание структуры директорий
mkdir -p src/{api,config,controllers,middleware,models,services,utils}
mkdir -p tests/{unit,integration}

echo -e "${GREEN}Структура директорий создана${NC}"

# Создание package.json
cat > package.json << 'EOF'
{
  "name": "community-upgrade-backend",
  "version": "0.1.0",
  "description": "Backend service for CommunityUpgrade platform",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "keywords": [
    "crowdfunding",
    "community",
    "upgrade",
    "nodejs",
    "express"
  ],
  "author": "CommunityUpgrade Team",
  "license": "MIT",
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "redis": "^4.6.8",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "eslint": "^8.48.0",
    "eslint-config-airbnb-base": "^15.0.0",
    "eslint-plugin-import": "^2.28.1",
    "jest": "^29.6.4",
    "nodemon": "^3.0.1",
    "supertest": "^6.3.3"
  }
}
