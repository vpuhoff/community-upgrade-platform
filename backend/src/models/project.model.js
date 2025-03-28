const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Stage name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Stage description is required']
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [100, 'Budget must be at least 100']
  },
  currentFunding: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'fundraising', 'voting', 'inProgress', 'completed'],
    default: 'pending'
  },
  contractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dependencies: [{
    stage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stage'
    },
    type: {
      type: String,
      enum: ['finishToStart', 'startToStart'],
      default: 'finishToStart'
    }
  }],
  order: {
    type: Number,
    required: true
  }
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['park', 'playground', 'sport', 'infrastructure', 'green', 'other']
  },
  location: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  images: [{
    type: String
  }],
  totalBudget: {
    type: Number,
    required: [true, 'Total budget is required'],
    min: [1000, 'Total budget must be at least 1000']
  },
  currentFunding: {
    type: Number,
    default: 0
  },
  stages: [stageSchema],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'funded', 'inProgress', 'completed', 'canceled'],
    default: 'draft'
  },
  contributors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      required: true
    },
    targetStage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stage'
    },
    date: {
      type: Date,
      default: Date.now
    },
    anonymous: {
      type: Boolean,
      default: false
    }
  }],
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Пространственный индекс для локации
projectSchema.index({ location: '2dsphere' });

// Виртуальное свойство для вычисления процента финансирования
projectSchema.virtual('fundingPercentage').get(function() {
  return (this.currentFunding / this.totalBudget) * 100;
});

// Виртуальное свойство для вычисления длительности проекта (в днях)
projectSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.endDate) return null;
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Виртуальное свойство для вычисления количества дней до окончания сбора средств
projectSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return null;
  const today = new Date();
  return Math.ceil((this.endDate - today) / (1000 * 60 * 60 * 24));
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
