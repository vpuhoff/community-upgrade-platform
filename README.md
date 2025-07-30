# CommunityUpgrade 🏘️

Платформа для коллективного финансирования локальных проектов благоустройства, позволяющая жителям объединяться для реализации общественных инициатив в своих районах.

![CommunityUpgrade](https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop&q=80)

## 🎯 О проекте

CommunityUpgrade - это современная веб-платформа, которая помогает сообществам собирать средства на локальные проекты благоустройства. Платформа объединяет жителей, позволяя им предлагать, финансировать и реализовывать проекты, которые улучшают качество жизни в их районах.

### ✨ Ключевые особенности

- 🗺️ **Интерактивная карта проектов** с геолокацией
- 💰 **Система краудфандинга** с безопасными платежами
- 👥 **Управление пользователями** и профилями
- 📝 **Создание и модерация проектов**
- 🏆 **Геймификация** с системой бейджей и достижений
- 💬 **Система комментариев** и обсуждений
- 🔍 **Выбор подрядчиков** для реализации проектов
- 📊 **Детальная аналитика** и отчетность

## 🛠️ Технологический стек

### Frontend
- **React 18** - Основной фреймворк
- **TypeScript** - Типизация
- **Tailwind CSS v4** - Стилизация
- **Shadcn/ui** - UI компоненты
- **Leaflet** - Интерактивные карты
- **Lucide React** - Иконки
- **Motion** - Анимации

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - База данных
- **Supabase Auth** - Аутентификация
- **Supabase Edge Functions** - Серверная логика
- **Supabase Storage** - Файловое хранилище

### Инфраструктура
- **Vercel/Netlify** - Хостинг (рекомендуется)
- **GitHub Actions** - CI/CD
- **Supabase** - Управляемая база данных и API

## 🏗️ Архитектура

### Структура проекта

```
CommunityUpgrade/
├── App.tsx                     # Главный компонент приложения
├── components/                 # React компоненты
│   ├── Auth.tsx               # Компонент авторизации
│   ├── CreateProject.tsx      # Создание новых проектов
│   ├── Header.tsx             # Навигационная панель
│   ├── InteractiveMap.tsx     # Интерактивная карта Leaflet
│   ├── ProjectDetails.tsx     # Детальная страница проекта
│   ├── ProjectMap.tsx         # Карта проектов с сайдбаром
│   ├── ProjectMapSidebar.tsx  # Боковая панель карты
│   ├── ProjectsList.tsx       # Список всех проектов
│   ├── UserProfile.tsx        # Профиль пользователя
│   └── ui/                    # Переиспользуемые UI компоненты
├── data/                      # Типы данных и демо-данные
│   └── demoProjects.ts        # Примеры проектов
├── styles/                    # Глобальные стили
│   └── globals.css            # Tailwind CSS и кастомные стили
├── supabase/                  # Серверная логика
│   └── functions/             # Edge Functions
└── utils/                     # Утилиты и API клиенты
    ├── projectsApi.ts         # API для работы с проектами
    ├── projectDetailsApi.ts   # API деталей проектов
    └── supabase/              # Конфигурация Supabase
```

### Компонентная архитектура

```
App
├── Header (навигация, авторизация)
├── ProjectMap (карта + сайдбар)
│   ├── InteractiveMap (Leaflet карта)
│   └── ProjectMapSidebar (список проектов)
├── ProjectsList (табличный вид проектов)
├── ProjectDetails (детали проекта + пожертвования)
├── UserProfile (профиль пользователя)
├── CreateProject (создание проекта)
└── Auth (модальное окно авторизации)
```

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- npm или yarn
- Аккаунт Supabase

### Установка

1. **Клонирование репозитория**
```bash
git clone https://github.com/your-username/community-upgrade.git
cd community-upgrade
```

2. **Установка зависимостей**
```bash
npm install
# или
yarn install
```

3. **Настройка Supabase**

Создайте новый проект в [Supabase](https://supabase.com) и получите:
- Project URL
- Anon public key
- Service role key

4. **Настройка переменных окружения**

Обновите файл `utils/supabase/info.tsx`:
```typescript
export const projectId = 'your-project-id';
export const publicAnonKey = 'your-anon-key';
```

5. **Настройка базы данных**

Выполните SQL миграции в Supabase SQL Editor:

```sql
-- Создание таблицы проектов
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  target_amount INTEGER NOT NULL,
  current_amount INTEGER DEFAULT 0,
  donors_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы пользователей
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  total_donated INTEGER DEFAULT 0,
  projects_supported INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы пожертвований
CREATE TABLE donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  message TEXT,
  anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS политики
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Политики для проектов (чтение для всех)
CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

-- Политики для профилей
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

6. **Деплой Edge Functions**

```bash
# Установка Supabase CLI
npm install -g supabase

# Логин в Supabase
supabase login

# Линковка проекта
supabase link --project-ref your-project-id

# Деплой функций
supabase functions deploy
```

7. **Запуск приложения**

```bash
npm start
# или
yarn start
```

Приложение будет доступно по адресу `http://localhost:3000`

## 📋 Основная функциональность

### 🗺️ Карта проектов

- Интерактивная карта с маркерами проектов
- Кластеризация маркеров при увеличении
- Попапы с краткой информацией о проектах
- Фильтрация по статусу и категориям
- Геопоиск и определение местоположения

### 💰 Система финансирования

- Безопасные онлайн платежи
- Отслеживание прогресса сбора средств
- История пожертвований
- Возможность анонимных пожертвований
- Автоматические уведомления о достижении целей

### 👤 Управление пользователями

- Регистрация и авторизация
- Профили пользователей с статистикой
- Система достижений и бейджей
- История участия в проектах

### 📝 Управление проектами

- Создание новых проектов с детальным описанием
- Загрузка изображений и документов
- Модерация проектов
- Система комментариев и обсуждений
- Отчеты о ходе реализации

## 🔌 API Документация

### Проекты

#### Получение списка проектов
```typescript
GET /api/projects
Response: Project[]

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  targetAmount: number;
  currentAmount: number;
  donorsCount: number;
  status: 'active' | 'completed' | 'paused';
  image: string;
  createdAt: string;
}
```

#### Создание проекта
```typescript
POST /api/projects
Body: CreateProjectRequest

interface CreateProjectRequest {
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  targetAmount: number;
  image?: string;
}
```

#### Получение деталей проекта
```typescript
GET /api/projects/:id
Response: ProjectDetails

interface ProjectDetails extends Project {
  longDescription: string;
  milestones: Milestone[];
  donations: Donation[];
  comments: Comment[];
}
```

### Пожертвования

#### Создание пожертвования
```typescript
POST /api/donations
Body: CreateDonationRequest

interface CreateDonationRequest {
  projectId: string;
  amount: number;
  message?: string;
  anonymous?: boolean;
}
```

### Пользователи

#### Получение профиля
```typescript
GET /api/profile
Response: UserProfile

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  totalDonated: number;
  projectsSupported: number;
  badges: Badge[];
}
```

## 🎨 Дизайн система

### Цветовая палитра

```css
/* Основные цвета */
--primary: #030213;           /* Основной цвет */
--primary-foreground: #ffffff; /* Текст на основном цвете */
--secondary: #f1f5f9;         /* Вторичный цвет */
--accent: #e9ebef;            /* Акцентный цвет */

/* Состояния */
--destructive: #d4183d;       /* Ошибки */
--muted: #ececf0;             /* Приглушенный */
--border: rgba(0, 0, 0, 0.1); /* Границы */
```

### Типографика

- **Базовый размер шрифта**: 14px
- **Заголовки**: Medium weight (500)
- **Основной текст**: Normal weight (400)
- **Высота строки**: 1.5

### Компоненты

Проект использует [shadcn/ui](https://ui.shadcn.com/) для базовых компонентов:
- Button, Card, Input, Label
- Dialog, Tabs, Avatar, Badge
- Progress, Skeleton, Tooltip
- И многие другие...

## 🔒 Безопасность

### Аутентификация

- JWT токены через Supabase Auth
- Row Level Security (RLS) в PostgreSQL
- Безопасные HTTP-only cookies
- Автоматическое обновление токенов

### Платежи

- Интеграция с проверенными платежными системами
- PCI DSS соответствие
- Шифрование данных карт
- Защита от мошенничества

### Защита данных

- HTTPS везде
- Валидация на клиенте и сервере
- Санитизация пользовательского контента
- Защита от CSRF и XSS атак

## 📊 Производительность

### Оптимизации

- Ленивая загрузка компонентов
- Кэширование API запросов
- Оптимизация изображений
- Минификация и сжатие кода

### Метрики

- **Время первого рендера**: < 1.5 сек
- **Время до интерактивности**: < 3 сек
- **Поддержка одновременных пользователей**: 10,000+
- **Доступность**: WCAG 2.1 AA

## 🌍 Интернационализация

Проект готов к локализации:
- Все тексты вынесены в константы
- Поддержка RTL языков
- Локализация дат и чисел
- Мультиязычная поддержка контента

## 🧪 Тестирование

### Настройка тестов

```bash
# Установка зависимостей для тестирования
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Запуск тестов
npm test
```

### Типы тестов

- **Unit тесты**: Компоненты и утилиты
- **Integration тесты**: API эндпоинты
- **E2E тесты**: Пользовательские сценарии
- **Visual тесты**: Регрессионное тестирование UI

## 🚀 Деплой

### Vercel (Рекомендуется)

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения
3. Настройте автоматический деплой

### Netlify

1. Подключите репозиторий к Netlify
2. Настройте билд команды: `npm run build`
3. Укажите папку билда: `dist`

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Участие в разработке

### Как внести вклад

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Добавьте тесты
5. Отправьте Pull Request

### Стандарты кода

- ESLint + Prettier для форматирования
- Conventional Commits для коммитов
- TypeScript для типизации
- Документация для новых функций

### Структура коммитов

```
feat: добавить новую функцию
fix: исправить баг
docs: обновить документацию
style: изменения стилей
refactor: рефакторинг кода
test: добавить тесты
chore: обновление зависимостей
```

## 📈 Планы развития

### Ближайшие улучшения

- [ ] Мобильное приложение (React Native)
- [ ] Push уведомления
- [ ] Интеграция с социальными сетями
- [ ] Система репутации пользователей
- [ ] Мультитенантность для разных городов

### Долгосрочные планы

- [ ] AI рекомендации проектов
- [ ] Blockchain интеграция для прозрачности
- [ ] Интеграция с государственными услугами
- [ ] Система менторства для проектов
- [ ] Углеродный след проектов

## 📞 Поддержка

### Контакты

- **Email**: support@communityupgrade.com
- **Telegram**: @communityupgrade
- **GitHub Issues**: [Создать issue](https://github.com/your-username/community-upgrade/issues)

### Документация

- [Wiki](https://github.com/your-username/community-upgrade/wiki)
- [FAQ](https://github.com/your-username/community-upgrade/wiki/FAQ)
- [API Reference](https://docs.communityupgrade.com)

## 📄 Лицензия

Этот проект лицензирован под MIT License - смотрите [LICENSE](LICENSE) файл для деталей.

## 🙏 Благодарности

- [React](https://reactjs.org/) - За отличный фреймворк
- [Supabase](https://supabase.com/) - За мощный BaaS
- [Tailwind CSS](https://tailwindcss.com/) - За удобную стилизацию
- [shadcn/ui](https://ui.shadcn.com/) - За красивые компоненты
- [Leaflet](https://leafletjs.com/) - За интерактивные карты
- [Unsplash](https://unsplash.com/) - За качественные изображения

---

<div align="center">
  <strong>Сделано с ❤️ для улучшения городских сообществ</strong>
</div>