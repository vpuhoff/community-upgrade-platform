# Схема базы данных

## Обзор

Система CommunityUpgrade использует MongoDB в качестве основной базы данных. Ниже представлена схема коллекций и их взаимосвязи.

## Коллекции

### 1. Users (Пользователи)

```javascript
{
  _id: ObjectId,
  email: String,
  password: String (хеш),
  firstName: String,
  lastName: String,
  role: String (enum: user, admin, contractor, communityAdmin),
  avatar: String (URL),
  location: {
    type: String (Point),
    coordinates: [Number, Number] // [longitude, latitude]
  },
  level: Number,
  experience: Number,
  badges: [{ type: ObjectId, ref: 'Badge' }],
  contributions: [{
    project: { type: ObjectId, ref: 'Project' },
    amount: Number,
    date: Date
  }],
  isVerified: Boolean,
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date
}
```

### 2. Projects (Проекты)

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String (enum: park, playground, sport, infrastructure, green, other),
  location: {
    type: String (Polygon),
    coordinates: [[[Number, Number]]] // [[[lon1, lat1], [lon2, lat2], ...]]
  },
  images: [String] (URLs),
  totalBudget: Number,
  currentFunding: Number,
  creator: { type: ObjectId, ref: 'User' },
  status: String (enum: draft, active, funded, inProgress, completed, canceled),
  stages: [{
    name: String,
    description: String,
    budget: Number,
    currentFunding: Number,
    startDate: Date,
    endDate: Date,
    status: String (enum: pending, fundraising, voting, inProgress, completed),
    contractor: { type: ObjectId, ref: 'User' },
    order: Number
  }],
  contributors: [{
    user: { type: ObjectId, ref: 'User' },
    amount: Number,
    targetStage: { type: ObjectId },
    date: Date,
    anonymous: Boolean
  }],
  startDate: Date,
  endDate: Date,
  createdAt: Date
}
```

### 3. Comments (Комментарии)

```javascript
{
  _id: ObjectId,
  content: String,
  author: { type: ObjectId, ref: 'User' },
  project: { type: ObjectId, ref: 'Project' },
  parentComment: { type: ObjectId, ref: 'Comment' },
  replies: [{ type: ObjectId, ref: 'Comment' }],
  attachments: [String] (URLs),
  upvotes: Number,
  upvoters: [{
    user: { type: ObjectId, ref: 'User' }
  }],
  isEdited: Boolean,
  createdAt: Date
}
```

### 4. Proposals (Предложения)

```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  author: { type: ObjectId, ref: 'User' },
  project: { type: ObjectId, ref: 'Project' },
  category: String (enum: safety, comfort, budget, alternative, other),
  status: String (enum: pending, reviewing, approved, rejected, implemented),
  votes: Number,
  voters: [{
    user: { type: ObjectId, ref: 'User' },
    votedAt: Date
  }],
  attachments: [String] (URLs),
  adminComments: [{
    content: String,
    admin: { type: ObjectId, ref: 'User' },
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Badges (Бейджи)

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  icon: String (URL),
  category: String (enum: donation, participation, community, project, special),
  requirement: {
    type: String (enum: donationAmount, projectCount, commentCount, proposalCount, inviteCount, special),
    value: Number
  },
  rarity: String (enum: common, uncommon, rare, epic, legendary),
  createdAt: Date
}
```

### 6. ContractorApplications (Заявки подрядчиков)

```javascript
{
  _id: ObjectId,
  contractor: { type: ObjectId, ref: 'User' },
  stage: { type: ObjectId, ref: 'Project.stages' },
  project: { type: ObjectId, ref: 'Project' },
  price: Number,
  description: String,
  estimatedTime: Number, // в днях
  portfolio: [String] (URLs),
  votes: [{
    user: { type: ObjectId, ref: 'User' },
    votedAt: Date
  }],
  status: String (enum: pending, approved, rejected, selected),
  createdAt: Date
}
```

### 7. Transactions (Транзакции)

```javascript
{
  _id: ObjectId,
  user: { type: ObjectId, ref: 'User' },
  project: { type: ObjectId, ref: 'Project' },
  stage: { type: ObjectId },
  amount: Number,
  paymentMethod: String,
  status: String (enum: pending, completed, failed, refunded),
  paymentId: String,
  anonymous: Boolean,
  createdAt: Date
}
```

## Индексы

Для оптимизации производительности созданы следующие индексы:

1. Users:
   - email: 1 (unique)
   - location: 2dsphere

2. Projects:
   - location: 2dsphere
   - status: 1
   - category: 1
   - creator: 1

3. Comments:
   - project: 1
   - parentComment: 1
   - author: 1

4. Proposals:
   - project: 1
   - status: 1
   - author: 1


