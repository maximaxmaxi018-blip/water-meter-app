@echo off
chcp 65001 >nul
echo ========================================
echo   Загрузка проекта в GitHub
echo ========================================
echo.

echo Проверяем наличие Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ОШИБКА: Git не установлен!
    echo Скачайте Git с https://git-scm.com/download/win
    pause
    exit /b 1
)

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
pause