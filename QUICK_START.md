# Быстрый старт

## 1. Установите Git
https://git-scm.com/download/win

## 2. Создайте репозиторий на GitHub
- Перейдите на https://github.com/new
- Название: `water-meter-app`
- Нажмите "Create repository"

## 3. Загрузите проект
Откройте командную строку в этой папке:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/water-meter-app.git
git push -u origin main
```

## 4. Разверните на Railway (бэкенд)
- https://railway.app → "New Project" → "Deploy from GitHub"
- Выберите ваш репозиторий
- Добавьте переменные: PORT=3000, NODE_ENV=production

## 5. Разверните на Vercel (фронтенд)
- https://vercel.com → "New Project"
- Импортируйте репозиторий
- Добавьте VITE_API_URL с URL от Railway

Готово! 🚀