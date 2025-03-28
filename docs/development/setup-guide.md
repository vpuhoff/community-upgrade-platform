# Руководство по настройке среды разработки

## Предварительные требования

- Node.js (v14+)
- npm или yarn
- Docker и Docker Compose (опционально)
- MySQL/PostgreSQL
- Git

## Настройка локальной среды

1. Клонировать репозиторий:
```bash
git clone https://github.com/organization/community-upgrade-platform.git
cd community-upgrade-platform
```

2. Установить зависимости:
```bash
# Установка зависимостей фронтенда
cd frontend
npm install

# Установка зависимостей бэкенда
cd ../backend
npm install
```

3. Создать `.env` файл на основе примера:
```bash
cp .env.example .env
# Отредактировать .env с нужными параметрами
```

4. Запустить базу данных:
```bash
# Используя Docker
docker-compose up -d db
```

5. Запустить приложение:
```bash
# Запуск бэкенда
cd backend
npm run dev

# Запуск фронтенда (в отдельном терминале)
cd frontend
npm start
```

## Настройка Docker

Если вы предпочитаете использовать Docker для разработки:

```bash
docker-compose up -d
```

Это запустит все необходимые сервисы в контейнерах.
