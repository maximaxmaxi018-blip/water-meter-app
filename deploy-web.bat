@echo off
chcp 65001 >nul
echo 🚀 Автоматическое развертывание проекта

echo 📦 Создаю папку для деплоя...
if exist web-deploy rmdir /s /q web-deploy
mkdir web-deploy

echo 📋 Копирую файлы...
copy package.json web-deploy\ >nul
copy vite.config.ts web-deploy\ >nul
copy tsconfig.json web-deploy\ >nul
copy index.html web-deploy\ >nul
copy vercel.json web-deploy\ >nul
copy .env.example web-deploy\ >nul

mkdir web-deploy\src
copy App.tsx web-deploy\src\ >nul
copy index.tsx web-deploy\src\ >nul
copy types.ts web-deploy\src\ >nul
copy constants.tsx web-deploy\src\ >nul

xcopy /e /i components web-deploy\components >nul
xcopy /e /i pages web-deploy\pages >nul
xcopy /e /i services web-deploy\services >nul
xcopy /e /i backend web-deploy\backend >nul

echo node_modules/ > web-deploy\.gitignore
echo dist/ >> web-deploy\.gitignore
echo .env >> web-deploy\.gitignore

echo # Water Counter App > web-deploy\README.md
echo. >> web-deploy\README.md
echo Deploy to Railway + Vercel >> web-deploy\README.md

echo ✅ Файлы готовы в папке web-deploy

echo 🌐 Открываю GitHub...
start https://github.com/new

echo 📦 Создаю архив...
powershell -Command "Compress-Archive -Path 'web-deploy\*' -DestinationPath 'water-counter-final.zip' -Force"

echo ✅ Архив создан: water-counter-final.zip

echo.
echo 📋 СЛЕДУЮЩИЕ ШАГИ:
echo 1. Создайте репозиторий на GitHub
echo 2. Загрузите архив water-counter-final.zip
echo 3. Подключите к Railway.app (backend)
echo 4. Подключите к Vercel.com (frontend)

explorer web-deploy
pause