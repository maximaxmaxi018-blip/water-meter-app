# 🚀 ИНСТРУКЦИЯ ПО ДЕПЛОЮ - ВЫПОЛНИТЕ СЕЙЧАС

## 📋 Что у нас готово:
- ✅ Зависимости установлены
- ✅ Конфигурационные файлы настроены
- ✅ CLI инструменты установлены

## 🎯 ПОШАГОВЫЙ ДЕПЛОЙ (15 минут)

### 1️⃣ Деплой бэкенда на Railway (5 минут)

1. **Откройте браузер** и перейдите на https://railway.app
2. **Войдите** в аккаунт (GitHub/Google)
3. Нажмите **"New Project"**
4. Выберите **"Deploy from GitHub repo"**
5. Если репозитория нет, создайте его:
   - Перейдите на https://github.com/new
   - Название: `water-meter-app`
   - Сделайте публичным
   - Нажмите "Create repository"

6. **Загрузите код в GitHub:**
   ```bash
   # Откройте PowerShell в папке проекта
   cd "c:\Users\Макс\Desktop\Ладога Строй\Счетчик воды\Вариант 2"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ВАШ_USERNAME/water-meter-app.git
   git push -u origin main
   ```

7. **В Railway выберите ваш репозиторий**
8. **Настройте переменные окружения:**
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `water-meter-secret-key-2026`
   - `CORS_ORIGIN`: `*`

9. **Нажмите Deploy**
10. **Скопируйте URL** (например: `https://water-meter-app-production.up.railway.app`)

### 2️⃣ Деплой фронтенда на Vercel (5 минут)

1. **Откройте** https://vercel.com
2. **Войдите** в аккаунт
3. Нажмите **"New Project"**
4. **Импортируйте** ваш GitHub репозиторий
5. **Настройте переменные окружения:**
   - `VITE_API_URL`: (URL вашего бэкенда с Railway)
   - `VITE_API_KEY`: `AIzaSyByIiReJxgKGGcOs_2v_i9a5fbF40X_JGc`

6. **Нажмите Deploy**
7. **Скопируйте URL** фронтенда

### 3️⃣ Обновите CORS на бэкенде

1. **В Railway Dashboard** найдите ваш проект
2. **Перейдите в Variables**
3. **Обновите** `CORS_ORIGIN` на URL вашего фронтенда
4. **Redeploy** сервис

## ✅ ГОТОВО!

Ваше приложение теперь работает в интернете!

## 🔧 Альтернативный способ (если GitHub недоступен)

### Используйте Render.com (бесплатно):

1. **Бэкенд на Render:**
   - Перейдите на https://render.com
   - New → Web Service
   - Connect GitHub или загрузите ZIP
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Фронтенд на Netlify:**
   - Перейдите на https://netlify.com
   - Drag & Drop папку `dist` после `npm run build`

## 🆘 Нужна помощь?

Если что-то не работает:
1. Проверьте логи в Dashboard платформы
2. Убедитесь, что переменные окружения правильно установлены
3. Проверьте, что URL бэкенда правильно указан в фронтенде