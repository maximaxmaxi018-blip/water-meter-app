# 🚀 Быстрое развертывание на Vercel + Railway

## Что нужно сделать

### 1️⃣ Создайте GitHub репозиторий

```bash
# Откройте PowerShell в папке проекта
cd "c:\Users\Макс\Desktop\Ладога Строй\Счетчик воды\Вариант 2"

# Инициализируйте Git
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Добавьте удаленный репозиторий (замените YOUR_USERNAME и REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

### 2️⃣ Развертывание бэкенда на Railway (5 минут)

1. Перейдите на https://railway.app
2. Нажмите **"New Project"** → **"Deploy from GitHub"**
3. Авторизуйтесь и выберите ваш репозиторий
4. Railway автоматически обнаружит Node.js проект
5. Добавьте переменные окружения:
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (любая случайная строка)

6. Нажмите **"Deploy"**
7. Дождитесь завершения (зеленая галочка)
8. **Скопируйте URL** вашего бэкенда (например: `https://water-meter-app-production.up.railway.app`)

### 3️⃣ Развертывание фронтенда на Vercel (5 минут)

1. Перейдите на https://vercel.com
2. Нажмите **"New Project"**
3. Импортируйте ваш GitHub репозиторий
4. Vercel автоматически обнаружит React проект
5. В разделе **"Environment Variables"** добавьте:
   - Ключ: `VITE_API_URL`
   - Значение: (URL вашего бэкенда с Railway)
   
   Например: `https://water-meter-app-production.up.railway.app`

6. Нажмите **"Deploy"**
7. Дождитесь завершения
8. **Скопируйте URL** вашего фронтенда (например: `https://water-meter-app.vercel.app`)

## ✅ Готово!

Ваше приложение теперь доступно в интернете!

**Ссылка для тестирования:**
```
https://water-meter-app.vercel.app
```

## 🔄 Автоматическое развертывание

Каждый раз, когда вы делаете `git push`:
- Railway автоматически перестроит бэкенд
- Vercel автоматически перестроит фронтенд

```bash
git add .
git commit -m "Your changes"
git push
```

## 📊 Мониторинг

- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard

## 🧪 Тестирование

1. Откройте URL фронтенда в браузере
2. Проверьте, что приложение загружается
3. Попробуйте войти с тестовыми учетными данными
4. Проверьте, что данные загружаются с бэкенда

## 🆘 Если что-то не работает

### Бэкенд не запускается
- Проверьте логи на Railway Dashboard
- Убедитесь, что `backend/package.json` существует
- Проверьте переменные окружения

### Фронтенд не подключается к бэкенду
- Проверьте, что `VITE_API_URL` правильно установлена на Vercel
- Откройте DevTools (F12) → Network → проверьте запросы
- Убедитесь, что бэкенд запущен и доступен

### CORS ошибки
- Проверьте, что CORS включен на бэкенде
- Убедитесь, что `FRONTEND_URL` переменная установлена на Railway

## 📝 Дополнительно

Для более подробной информации смотрите `DEPLOYMENT_GUIDE.md`
