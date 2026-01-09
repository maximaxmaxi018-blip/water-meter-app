# Развертывание проекта на Vercel + Railway

## Шаг 1: Подготовка GitHub репозитория

1. Создайте новый репозиторий на GitHub: https://github.com/new
2. Назовите его (например: `water-meter-app`)
3. Инициализируйте Git локально:

```bash
cd "c:\Users\Макс\Desktop\Ладога Строй\Счетчик воды\Вариант 2"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/water-meter-app.git
git push -u origin main
```

## Шаг 2: Развертывание бэкенда на Railway

1. Перейдите на https://railway.app
2. Нажмите "New Project" → "Deploy from GitHub"
3. Авторизуйтесь с GitHub
4. Выберите ваш репозиторий `water-meter-app`
5. Railway автоматически обнаружит Node.js проект
6. Добавьте переменные окружения в Railway:
   - `PORT`: 3000
   - `NODE_ENV`: production
   - `JWT_SECRET`: (сгенерируйте случайную строку)

7. Нажмите "Deploy"
8. Скопируйте URL вашего бэкенда (например: `https://water-meter-app-production.up.railway.app`)

## Шаг 3: Развертывание фронтенда на Vercel

1. Перейдите на https://vercel.com
2. Нажмите "New Project"
3. Импортируйте ваш GitHub репозиторий
4. Vercel автоматически обнаружит React проект
5. В разделе "Environment Variables" добавьте:
   - `VITE_API_URL`: (URL вашего бэкенда с Railway)
   
   Например: `https://water-meter-app-production.up.railway.app`

6. Нажмите "Deploy"
7. Дождитесь завершения развертывания
8. Скопируйте URL вашего фронтенда (например: `https://water-meter-app.vercel.app`)

## Шаг 4: Обновление apiClient

Убедитесь, что ваш `apiClient.ts` использует переменную окружения:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

## Шаг 5: Тестирование

1. Откройте URL вашего фронтенда в браузере
2. Проверьте, что приложение загружается
3. Попробуйте войти с тестовыми учетными данными
4. Проверьте, что данные загружаются с бэкенда

## Автоматическое развертывание

После этого каждый раз, когда вы делаете `git push` в `main` ветку:
- Railway автоматически перестроит и развернет бэкенд
- Vercel автоматически перестроит и развернет фронтенд

## Ссылка для тестирования

Поделитесь этой ссылкой с людьми для тестирования:
```
https://water-meter-app.vercel.app
```

## Мониторинг

- Railway: https://railway.app/dashboard
- Vercel: https://vercel.com/dashboard
