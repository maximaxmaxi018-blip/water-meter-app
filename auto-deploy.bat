@echo off
chcp 65001 >nul
echo 🚀 Начинаем автоматический деплой...

REM Проверяем наличие Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не найден. Установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

REM Проверяем Vercel CLI
vercel --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Устанавливаем Vercel CLI...
    npm install -g vercel
)

REM Проверяем Railway CLI
railway version >nul 2>&1
if errorlevel 1 (
    echo 📦 Устанавливаем Railway CLI...
    npm install -g @railway/cli
)

REM Инициализируем Git если нужно
if not exist ".git" (
    echo 📦 Инициализируем Git репозиторий...
    git init
    git add .
    git commit -m "Initial commit for deployment"
)

REM Создаем .env если его нет
if not exist ".env" (
    copy ".env.example" ".env"
    echo 📝 Создан .env файл из примера
)

echo 🚂 Деплоим бэкенд на Railway...
cd backend

REM Логинимся в Railway
railway whoami >nul 2>&1
if errorlevel 1 (
    echo 🔐 Необходимо войти в Railway...
    railway login
)

REM Создаем проект
echo 📋 Создаем проект на Railway...
railway project new

REM Устанавливаем переменные окружения
echo ⚙️ Настраиваем переменные окружения...
railway variables set NODE_ENV=production
railway variables set PORT=3000

REM Генерируем JWT секрет
set "chars=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
set "jwt_secret="
for /l %%i in (1,1,32) do (
    set /a "rand=!random! %% 62"
    for %%j in (!rand!) do set "jwt_secret=!jwt_secret!!chars:~%%j,1!"
)
railway variables set JWT_SECRET=%jwt_secret%

REM Деплоим бэкенд
echo 🚀 Деплоим бэкенд...
railway up --detach

REM Получаем URL
for /f "tokens=*" %%i in ('railway domain') do set backend_url=%%i
echo ✅ Бэкенд развернут: %backend_url%

cd ..

echo ⚡ Деплоим фронтенд на Vercel...

REM Логинимся в Vercel
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo 🔐 Необходимо войти в Vercel...
    vercel login
)

REM Деплоим фронтенд
echo 🚀 Деплоим фронтенд...
vercel --prod

echo 🎉 Деплой завершен!
echo 📋 Проверьте ваши приложения:
echo    🚂 Бэкенд (Railway): %backend_url%
echo    ⚡ Фронтенд (Vercel): проверьте вывод команды выше
echo.
echo 💡 Не забудьте обновить VITE_API_URL в настройках Vercel!
pause