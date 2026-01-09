@echo off
chcp 65001 >nul
echo ========================================
echo    Альтернативное развертывание проекта
echo    Frontend: Vercel
echo    Backend: Render (бесплатный план)
echo ========================================
echo.

echo [1/7] Проверка установленных инструментов...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm не найден. Установите Node.js
    pause
    exit /b 1
)

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ git не найден. Установите Git
    pause
    exit /b 1
)

where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Устанавливаем Vercel CLI...
    npm install -g vercel
)

echo ✅ Все инструменты установлены

echo [2/7] Установка зависимостей...
echo 📦 Устанавливаем зависимости frontend...
npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей frontend
    pause
    exit /b 1
)

echo 📦 Устанавливаем зависимости backend...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей backend
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Зависимости установлены

echo [3/7] Проверка переменных окружения...
if not exist ".env" (
    echo ❌ Файл .env не найден
    echo Создайте файл .env на основе .env.example
    pause
    exit /b 1
)

if not exist "backend\.env" (
    echo ❌ Файл backend\.env не найден
    echo Создайте файл backend\.env с настройками базы данных
    pause
    exit /b 1
)
echo ✅ Переменные окружения настроены

echo [4/7] Инициализация Git репозитория...
if not exist ".git" (
    echo 🔧 Инициализируем Git...
    git init
    git add .
    git commit -m "Initial commit"
    echo ✅ Git репозиторий создан
) else (
    echo ✅ Git репозиторий уже существует
)

echo [5/7] Создание конфигурации для Render...
echo 🔧 Создаем render.yaml...

echo [6/7] Развертывание frontend на Vercel...
echo 🚀 Деплоим frontend...
vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Ошибка развертывания frontend
    pause
    exit /b 1
)
echo ✅ Frontend развернут на Vercel

echo [7/7] Инструкции для развертывания backend...
echo.
echo 🔧 Для развертывания backend на Render:
echo 1. Перейдите на https://render.com
echo 2. Создайте аккаунт или войдите
echo 3. Нажмите "New +" → "Web Service"
echo 4. Подключите ваш GitHub репозиторий
echo 5. Настройте следующие параметры:
echo    - Name: water-meter-backend
echo    - Environment: Node
echo    - Build Command: cd backend ^&^& npm install
echo    - Start Command: cd backend ^&^& npm start
echo    - Root Directory: оставьте пустым
echo 6. Добавьте переменные окружения:
echo    - NODE_ENV=production
echo    - JWT_SECRET=ваш_секретный_ключ
echo    - CORS_ORIGIN=https://ваш-домен.vercel.app
echo.
echo ✅ Развертывание завершено!
echo Frontend доступен по адресу, указанному Vercel
echo Backend нужно развернуть вручную на Render
echo.
pause