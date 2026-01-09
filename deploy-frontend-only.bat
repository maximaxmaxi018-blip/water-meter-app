@echo off
chcp 65001 >nul
echo ========================================
echo    Быстрое развертывание Frontend
echo    Платформа: Vercel
echo ========================================
echo.

echo [1/4] Проверка Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Устанавливаем Vercel CLI...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo ❌ Ошибка установки Vercel CLI
        pause
        exit /b 1
    )
)
echo ✅ Vercel CLI готов

echo [2/4] Установка зависимостей...
npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей
    pause
    exit /b 1
)
echo ✅ Зависимости установлены

echo [3/4] Сборка проекта...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Ошибка сборки проекта
    pause
    exit /b 1
)
echo ✅ Проект собран

echo [4/4] Развертывание на Vercel...
vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Ошибка развертывания
    pause
    exit /b 1
)

echo.
echo ✅ Frontend успешно развернут на Vercel!
echo.
echo 📝 Следующие шаги:
echo 1. Скопируйте URL вашего сайта из вывода Vercel
echo 2. Для backend используйте один из вариантов:
echo    - Render.com (бесплатно)
echo    - Heroku (платно)
echo    - DigitalOcean App Platform
echo    - Или запустите локально: npm run dev в папке backend
echo.
pause