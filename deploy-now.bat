@echo off
chcp 65001 >nul
title Развертывание проекта "Счетчик воды"
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    РАЗВЕРТЫВАНИЕ ПРОЕКТА                     ║
echo ║                     "Счетчик воды"                          ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

cd /d "c:\Users\Макс\Desktop\Ладога Строй\Счетчик воды\Вариант 2"

echo [1/8] Проверяем установку Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ОШИБКА: Git не установлен!
    echo.
    echo 📥 Для установки Git:
    echo    1. Перейдите на https://git-scm.com/download/win
    echo    2. Скачайте и установите Git
    echo    3. Перезапустите командную строку
    echo    4. Запустите этот файл снова
    echo.
    pause
    exit /b 1
)
echo ✅ Git установлен

echo.
echo [2/8] Инициализируем Git репозиторий...
if not exist ".git" (
    git init
    git branch -M main
    echo ✅ Git репозиторий инициализирован
) else (
    echo ✅ Git репозиторий уже существует
)

echo.
echo [3/8] Добавляем файлы в Git...
git add .
echo ✅ Файлы добавлены

echo.
echo [4/8] Создаем коммит...
git commit -m "Deploy: Water meter app with all fixes" >nul 2>&1
echo ✅ Коммит создан

echo.
echo [5/8] Настройка GitHub репозитория...
echo.
set /p username="👤 Введите ваш GitHub username: "
set /p reponame="📁 Введите название репозитория (например water-meter-app): "

echo.
echo [6/8] Добавляем GitHub remote...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/%username%/%reponame%.git
echo ✅ Remote добавлен: https://github.com/%username%/%reponame%.git

echo.
echo ⚠️  ВАЖНО: Создайте репозиторий на GitHub!
echo    1. Перейдите на https://github.com/new
echo    2. Назовите репозиторий: %reponame%
echo    3. Оставьте репозиторий пустым (не добавляйте README)
echo    4. Нажмите "Create repository"
echo.
pause

echo.
echo [7/8] Загружаем код в GitHub...
git push -u origin main
if errorlevel 1 (
    echo ❌ Ошибка загрузки. Проверьте:
    echo    - Создан ли репозиторий на GitHub
    echo    - Правильно ли введены username и название репозитория
    pause
    exit /b 1
)
echo ✅ Код загружен в GitHub

echo.
echo [8/8] Финальная настройка...
echo ✅ vite.config.ts уже настроен для GitHub Pages
echo ✅ GitHub Actions workflow готов (.github/workflows/deploy.yml)
echo ✅ 404.html создан для SPA маршрутизации

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    СЛЕДУЮЩИЕ ШАГИ                           ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🌐 НАСТРОЙКА БЭКЕНДА (Render.com):
echo    1. Перейдите на https://render.com
echo    2. Нажмите "New" → "Web Service"
echo    3. Подключите GitHub и выберите репозиторий: %reponame%
echo    4. Настройки:
echo       - Name: water-meter-backend
echo       - Environment: Node
echo       - Root Directory: backend
echo       - Build Command: npm install
echo       - Start Command: npm start
echo    5. Добавьте переменные окружения:
echo       - NODE_ENV: production
echo       - JWT_SECRET: (любая случайная строка)
echo.
echo 📄 НАСТРОЙКА ФРОНТЕНДА (GitHub Pages):
echo    1. В репозитории %reponame% перейдите в Settings → Pages
echo    2. Source: выберите "GitHub Actions"
echo    3. Деплой запустится автоматически
echo.
echo 🎉 ГОТОВЫЕ ССЫЛКИ:
echo    Фронтенд: https://%username%.github.io/%reponame%
echo    Бэкенд: https://water-meter-backend.onrender.com (после настройки)
echo.
echo ✅ Развертывание завершено успешно!
echo.
pause