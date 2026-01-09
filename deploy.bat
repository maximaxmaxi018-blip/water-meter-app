@echo off
chcp 65001 >nul
echo ========================================
<<<<<<< HEAD
echo   Загрузка проекта в GitHub
echo ========================================
echo.

echo Проверяем наличие Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ОШИБКА: Git не установлен!
    echo Скачайте Git с https://git-scm.com/download/win
=======
echo   Автоматическое развертывание проекта
echo   Frontend: Vercel
echo   Backend: Railway
echo ========================================
echo.

:: Проверяем наличие необходимых CLI
echo [1/6] Проверка установленных инструментов...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI не установлен. Устанавливаем...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo ❌ Ошибка установки Vercel CLI
        pause
        exit /b 1
    )
)

where railway >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI не установлен. Устанавливаем...
    npm install -g @railway/cli
    if %errorlevel% neq 0 (
        echo ❌ Ошибка установки Railway CLI
        pause
        exit /b 1
    )
)

echo ✅ Все инструменты установлены

:: Устанавливаем зависимости
echo.
echo [2/6] Установка зависимостей...
echo 📦 Устанавливаем зависимости frontend...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей frontend
>>>>>>> ba2a6083e025fd17ad561633e28a0fe7cee17b19
    pause
    exit /b 1
)

<<<<<<< HEAD
echo Git найден!
echo.

echo Инициализируем Git репозиторий...
git init

echo Добавляем все файлы...
git add .

echo Создаем первый коммит...
git commit -m "Initial commit: Water Meter Management System"

echo.
echo ========================================
echo ВАЖНО: Создайте репозиторий на GitHub!
echo ========================================
echo 1. Перейдите на https://github.com/new
echo 2. Назовите репозиторий: water-meter-app
echo 3. НЕ добавляйте README, .gitignore или лицензию
echo 4. Нажмите "Create repository"
echo.

set /p username="Введите ваш GitHub username: "
set /p reponame="Введите название репозитория (по умолчанию water-meter-app): "

if "%reponame%"=="" set reponame=water-meter-app

echo.
echo Добавляем удаленный репозиторий...
git branch -M main
git remote add origin https://github.com/%username%/%reponame%.git

echo.
echo Загружаем код в GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ОШИБКА при загрузке!
    echo Возможные причины:
    echo - Репозиторий не создан на GitHub
    echo - Неверное имя пользователя или репозитория
    echo - Нет прав доступа
    echo.
    echo Попробуйте выполнить команды вручную:
    echo git remote add origin https://github.com/%username%/%reponame%.git
    echo git push -u origin main
) else (
    echo.
    echo ========================================
    echo   УСПЕШНО ЗАГРУЖЕНО!
    echo ========================================
    echo.
    echo Ваш репозиторий: https://github.com/%username%/%reponame%
    echo.
    echo Следующие шаги:
    echo 1. Разверните бэкенд на Railway: https://railway.app
    echo 2. Разверните фронтенд на Vercel: https://vercel.com
    echo 3. Следуйте инструкциям в DEPLOYMENT_GUIDE.md
)

echo.
=======
echo 📦 Устанавливаем зависимости backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей backend
    cd ..
    pause
    exit /b 1
)
cd ..

echo ✅ Зависимости установлены

:: Проверяем переменные окружения
echo.
echo [3/6] Проверка переменных окружения...
if not exist .env (
    echo ⚠️  Файл .env не найден. Создаем из примера...
    copy .env.example .env
    echo ⚠️  Пожалуйста, отредактируйте файл .env перед продолжением
    notepad .env
    pause
)

if not exist backend\.env (
    echo ⚠️  Файл backend\.env не найден. Создаем...
    echo PORT=3001> backend\.env
    echo JWT_SECRET=your-super-secret-jwt-key-here>> backend\.env
    echo NODE_ENV=production>> backend\.env
    echo ⚠️  Пожалуйста, отредактируйте файл backend\.env
    notepad backend\.env
    pause
)

echo ✅ Переменные окружения настроены

:: Деплой backend на Railway
echo.
echo [4/6] Развертывание backend на Railway...
cd backend
echo 🚂 Логинимся в Railway...
call railway login
if %errorlevel% neq 0 (
    echo ❌ Ошибка входа в Railway
    cd ..
    pause
    exit /b 1
)

echo 🚂 Создаем новый проект или подключаемся к существующему...
call railway link
if %errorlevel% neq 0 (
    echo 🚂 Создаем новый проект...
    call railway init
)

echo 🚂 Деплоим backend...
call railway up
if %errorlevel% neq 0 (
    echo ❌ Ошибка деплоя backend
    cd ..
    pause
    exit /b 1
)

echo 🚂 Получаем URL backend...
for /f "tokens=*" %%i in ('railway domain') do set BACKEND_URL=%%i
if "%BACKEND_URL%"=="" (
    echo ⚠️  Не удалось получить URL backend автоматически
    echo Пожалуйста, получите URL вручную: railway domain
    set /p BACKEND_URL="Введите URL backend (например, https://your-app.railway.app): "
)

cd ..
echo ✅ Backend развернут: %BACKEND_URL%

:: Обновляем конфигурацию frontend
echo.
echo [5/6] Настройка frontend для production...
echo VITE_API_URL=%BACKEND_URL% > .env.production

:: Деплой frontend на Vercel
echo.
echo [6/6] Развертывание frontend на Vercel...
echo 🔺 Логинимся в Vercel...
call vercel login
if %errorlevel% neq 0 (
    echo ❌ Ошибка входа в Vercel
    pause
    exit /b 1
)

echo 🔺 Деплоим frontend...
call vercel --prod --env VITE_API_URL=%BACKEND_URL%
if %errorlevel% neq 0 (
    echo ❌ Ошибка деплоя frontend
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ Развертывание завершено успешно!
echo.
echo 🔗 Backend URL: %BACKEND_URL%
echo 🔗 Frontend URL: Смотрите вывод Vercel выше
echo.
echo 📝 Следующие шаги:
echo 1. Проверьте работу приложения
echo 2. Настройте домен (опционально)
echo 3. Настройте мониторинг
echo ========================================
>>>>>>> ba2a6083e025fd17ad561633e28a0fe7cee17b19
pause