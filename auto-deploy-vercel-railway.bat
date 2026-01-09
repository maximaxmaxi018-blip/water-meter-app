@echo off
echo 🚀 Начинаем автоматический деплой...

echo 📋 Проверяем CLI инструменты...

REM Проверяем и устанавливаем Vercel CLI
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI не найден. Устанавливаем...
    npm install -g vercel
) else (
    echo ✅ Vercel CLI найден
)

REM Проверяем и устанавливаем Railway CLI
railway version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI не найден. Устанавливаем...
    npm install -g @railway/cli
) else (
    echo ✅ Railway CLI найден
)

echo 📦 Устанавливаем зависимости фронтенда...
npm install

echo 📦 Устанавливаем зависимости бэкенда...
cd backend
npm install
cd ..

echo 🚂 Деплоим бэкенд на Railway...
railway login
railway link
railway up

echo ⚡ Деплоим фронтенд на Vercel...
vercel login
vercel --prod

echo 🎉 Деплой завершен!
pause