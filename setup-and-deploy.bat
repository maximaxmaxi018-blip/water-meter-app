@echo off
chcp 65001 >nul
echo === Развертывание проекта ===

cd /d "c:\Users\Макс\Desktop\Ладога Строй\Счетчик воды\Вариант 2"

echo Проверяем Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ОШИБКА: Git не установлен!
    echo 1. Скачайте Git с https://git-scm.com/download/win
    echo 2. Установите с настройками по умолчанию
    echo 3. Перезапустите командную строку
    echo 4. Запустите этот файл снова
    pause
    exit /b 1
)

echo Git найден, продолжаем...

if not exist ".git" (
    echo Инициализируем Git репозиторий...
    git init
    git branch -M main
) else (
    echo Git репозиторий уже инициализирован
)

echo Добавляем файлы...
git add .

echo Создаем коммит...
git commit -m "Initial commit with fixes"

echo.
echo === Настройка GitHub ===
set /p username="Введите ваш GitHub username: "
set /p reponame="Введите название репозитория: "

echo Добавляем remote origin...
git remote add origin https://github.com/%username%/%reponame%.git 2>nul
if errorlevel 1 (
    echo Remote уже существует, обновляем...
    git remote set-url origin https://github.com/%username%/%reponame%.git
)

echo.
echo ВАЖНО: Создайте репозиторий %reponame% на GitHub!
echo Перейдите на https://github.com/new
pause

echo Загружаем код в GitHub...
git push -u origin main

echo.
echo === Обновляем vite.config.ts ===
(
echo import { defineConfig } from 'vite'
echo import react from '@vitejs/plugin-react'
echo.
echo export default defineConfig({
echo   plugins: [react()],
echo   base: '/%reponame%/',
echo   build: {
echo     outDir: 'dist'
echo   }
echo }^)
) > vite.config.ts

git add vite.config.ts
git commit -m "Update vite.config.ts for GitHub Pages"
git push

echo.
echo === ЗАВЕРШЕНИЕ РАЗВЕРТЫВАНИЯ ===
echo 1. Перейдите на https://render.com
echo 2. Создайте Web Service из GitHub репозитория
echo 3. Настройки:
echo    - Name: water-meter-backend
echo    - Environment: Node
echo    - Build Command: npm install
echo    - Start Command: npm start
echo    - Root Directory: backend
echo.
echo 4. В GitHub Settings → Pages выберите "GitHub Actions"
echo.
echo 5. Ваш сайт: https://%username%.github.io/%reponame%
echo.
echo Развертывание завершено!
pause