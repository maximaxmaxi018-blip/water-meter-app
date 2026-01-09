@echo off
echo 🚀 Создаем простой архив для деплоя...

REM Создаем временную папку
if exist simple-deploy rmdir /s /q simple-deploy
mkdir simple-deploy

REM Копируем основные файлы
copy package.json simple-deploy\
copy tsconfig.json simple-deploy\
copy vite.config.ts simple-deploy\
copy index.html simple-deploy\
copy vercel.json simple-deploy\
copy railway.json simple-deploy\
copy firebase.json simple-deploy\
copy .env.example simple-deploy\

REM Копируем папки с исходным кодом
xcopy /E /I components simple-deploy\components\
xcopy /E /I pages simple-deploy\pages\
xcopy /E /I services simple-deploy\services\

REM Копируем backend без базы данных
mkdir simple-deploy\backend
copy backend\package.json simple-deploy\backend\
copy backend\server.js simple-deploy\backend\
copy backend\database.js simple-deploy\backend\
copy backend\.env.example simple-deploy\backend\
xcopy /E /I backend\routes simple-deploy\backend\routes\

REM Создаем архив с помощью 7zip если есть, иначе tar
where 7z >nul 2>nul
if %errorlevel% == 0 (
    7z a -tzip water-counter-simple.zip simple-deploy\*
) else (
    tar -czf water-counter-simple.tar.gz simple-deploy
)

echo ✅ Архив создан!
echo 📦 Готов для загрузки на хостинг!
pause