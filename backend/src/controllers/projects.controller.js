const { validationResult } = require('express-validator');
const Project = require('../models/project.model');
const logger = require('../utils/logger');

// Получить все проекты с фильтрацией
exports.getProjects = async (req, res) => {
  try {
    const { 
      category, status, minFunding, maxFunding, 
      sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 
    } = req.query;

    // Формируем объект запроса
    const query = {};

    // Добавляем фильтры, если они есть
    if (category) query.category = category;
    if (status) query.status = status;
    if (minFunding) query.currentFunding = { $gte: Number(minFunding) };
    if (maxFunding) {
      query.currentFunding = { ...query.currentFunding, $lte: Number(maxFunding) };
    }

    // Вычисляем пропуск документов для пагинации
    const skip = (Number(page) - 1) * Number(limit);

    // Получаем проекты с сортировкой и пагинацией
    const projects = await Project.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('creator', 'firstName lastName')
      .select('-contributors'); // Исключаем список контрибьюторов для оптимизации

    // Получаем общее количество проектов для пагинации
    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      count: projects.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: projects
    });
  } catch (error) {
    logger.error(`Ошибка при получении проектов: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при получении проектов' });
  }
};

// Получить проект по ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'firstName lastName avatar')
      .populate('stages.contractor', 'firstName lastName avatar');

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error(`Ошибка при получении проекта: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при получении проекта' });
  }
};

// Получить проекты рядом с заданной локацией
exports.getNearbyProjects = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000 } = req.query; // maxDistance в метрах

    if (!lng || !lat) {
      return res.status(400).json({ message: 'Требуются координаты (lng, lat)' });
    }

    // Находим проекты рядом с заданной точкой
    const projects = await Project.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).select('title description category location status currentFunding totalBudget');

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    logger.error(`Ошибка при получении ближайших проектов: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при получении ближайших проектов' });
  }
};

// Создать новый проект
exports.createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { 
      title, description, category, location, 
      totalBudget, images, stages 
    } = req.body;

    // Создаем новый проект
    const project = new Project({
      title,
      description,
      category,
      location,
      totalBudget,
      images: images || [],
      creator: req.user.id,
      status: 'draft'
    });

    // Если предоставлены этапы, добавляем их
    if (stages && stages.length > 0) {
      // Добавляем порядковые номера к этапам
      const stagesWithOrder = stages.map((stage, index) => ({
        ...stage,
        order: index + 1
      }));
      
      project.stages = stagesWithOrder;
    }

    await project.save();

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error(`Ошибка при создании проекта: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при создании проекта' });
  }
};

// Обновить проект
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    // Проверяем права доступа (только создатель или администратор)
    if (project.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Обновляем проект
    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error(`Ошибка при обновлении проекта: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при обновлении проекта' });
  }
};

// Удалить проект
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    // Проверяем права доступа (только создатель или администратор)
    if (project.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Удаляем проект
    await project.remove();

    res.json({
      success: true,
      message: 'Проект успешно удален'
    });
  } catch (error) {
    logger.error(`Ошибка при удалении проекта: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при удалении проекта' });
  }
};

// Добавить этап к проекту
exports.addStageToProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, budget, dependencies } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    // Проверяем права доступа (только создатель или администратор)
    if (project.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Создаем новый этап
    const newStage = {
      name,
      description,
      budget,
      status: 'pending',
      order: project.stages.length + 1
    };

    // Если есть зависимости, добавляем их
    if (dependencies && dependencies.length > 0) {
      newStage.dependencies = dependencies;
    }

    // Добавляем этап к проекту
    project.stages.push(newStage);
    await project.save();

    res.status(201).json({
      success: true,
      data: project.stages[project.stages.length - 1]
    });
  } catch (error) {
    logger.error(`Ошибка при добавлении этапа к проекту: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при добавлении этапа к проекту' });
  }
};

// Получить все этапы проекта
exports.getProjectStages = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .select('stages')
      .populate('stages.contractor', 'firstName lastName avatar');

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    res.json({
      success: true,
      data: project.stages
    });
  } catch (error) {
    logger.error(`Ошибка при получении этапов проекта: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при получении этапов проекта' });
  }
};

// Обновить этап проекта
exports.updateProjectStage = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    // Проверяем права доступа (только создатель или администратор)
    if (project.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Находим этап в проекте
    const stageIndex = project.stages.findIndex(
      stage => stage._id.toString() === req.params.stageId
    );

    if (stageIndex === -1) {
      return res.status(404).json({ message: 'Этап не найден' });
    }

    // Обновляем этап
    Object.keys(req.body).forEach(key => {
      project.stages[stageIndex][key] = req.body[key];
    });

    await project.save();

    res.json({
      success: true,
      data: project.stages[stageIndex]
    });
  } catch (error) {
    logger.error(`Ошибка при обновлении этапа проекта: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при обновлении этапа проекта' });
  }
};

// Удалить этап проекта
exports.deleteProjectStage = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    // Проверяем права доступа (только создатель или администратор)
    if (project.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Находим этап в проекте
    const stageIndex = project.stages.findIndex(
      stage => stage._id.toString() === req.params.stageId
    );

    if (stageIndex === -1) {
      return res.status(404).json({ message: 'Этап не найден' });
    }

    // Проверяем, нет ли уже финансирования этапа
    if (project.stages[stageIndex].currentFunding > 0) {
      return res.status(400).json({ 
        message: 'Невозможно удалить этап, на который уже собраны средства' 
      });
    }

    // Удаляем этап
    project.stages.splice(stageIndex, 1);

    // Обновляем порядковые номера оставшихся этапов
    project.stages.forEach((stage, index) => {
      stage.order = index + 1;
    });

    await project.save();

    res.json({
      success: true,
      message: 'Этап успешно удален'
    });
  } catch (error) {
    logger.error(`Ошибка при удалении этапа проекта: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при удалении этапа проекта' });
  }
};

// Получить всех контрибьюторов проекта
exports.getProjectContributors = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .select('contributors')
      .populate('contributors.user', 'firstName lastName avatar');

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    // Фильтруем анонимных контрибьюторов (скрываем информацию о пользователе)
    const contributors = project.contributors.map(contrib => {
      if (contrib.anonymous) {
        return {
          amount: contrib.amount,
          date: contrib.date,
          targetStage: contrib.targetStage,
          anonymous: true
        };
      }
      return contrib;
    });

    res.json({
      success: true,
      data: contributors
    });
  } catch (error) {
    logger.error(`Ошибка при получении контрибьюторов проекта: ${error.message}`);
    res.status(500).json({ message: 'Произошла ошибка при получении контрибьюторов проекта' });
  }
};
