@echo off
chcp 65001 >nul
echo 🚀 Начинаем автоматический деплой проекта...

REM Проверяем наличие Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не найден. Установите Node.js и повторите попытку.
    pause
    exit /b 1
)

REM Проверяем наличие npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm не найден. Установите npm и повторите попытку.
    pause
    exit /b 1
)

echo ✅ Node.js и npm найдены

REM Инициализируем Git если его нет
if not exist ".git" (
    echo 📦 Инициализируем Git репозиторий...
    git init
    git add .
    git commit -m "Initial commit: Water meter management system"
)

REM Устанавливаем зависимости
echo 📦 Устанавливаем зависимости фронтенда...
npm install

echo 📦 Устанавливаем зависимости бэкенда...
cd backend
npm install
cd ..

REM Устанавливаем CLI инструменты
echo 📦 Устанавливаем Vercel CLI...
npm install -g vercel

echo 📦 Устанавливаем Railway CLI...
npm install -g @railway/cli

REM Создаем .vercelignore
echo backend/> .vercelignore
echo *.db>> .vercelignore
echo .env>> .vercelignore
echo .env.local>> .vercelignore
echo node_modules/>> .vercelignore
echo .git/>> .vercelignore

echo 🚀 Деплоим на Vercel...
echo Следуйте инструкциям для входа в Vercel
vercel --prod

echo 🚀 Деплоим на Railway...
echo Следуйте инструкциям для входа в Railway
railway login
railway up

echo 🎉 Деплой завершен!
echo 📋 Не забудьте:
echo 1. Скопировать URL бэкенда из Railway
echo 2. Обновить VITE_API_URL в настройках Vercel
echo 3. Перезапустить деплой фронтенда

pause