@echo off
chcp 65001 >nul
echo ========================================
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
    pause
    exit /b 1
)

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
pause