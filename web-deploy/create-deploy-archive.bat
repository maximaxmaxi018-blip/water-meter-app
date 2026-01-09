@echo off
echo 🚀 Создаем архив для деплоя...

REM Создаем временную папку
if exist deploy-temp rmdir /s /q deploy-temp
mkdir deploy-temp

REM Копируем основные файлы
copy *.json deploy-temp\
copy *.md deploy-temp\
copy *.html deploy-temp\
copy *.js deploy-temp\
copy *.bat deploy-temp\
copy .env.* deploy-temp\

REM Копируем папки
xcopy /E /I /Y src deploy-temp\src\
xcopy /E /I /Y public deploy-temp\public\
xcopy /E /I /Y dist deploy-temp\dist\

REM Копируем backend без базы данных
mkdir deploy-temp\backend
copy backend\*.json deploy-temp\backend\
copy backend\*.js deploy-temp\backend\
copy backend\*.md deploy-temp\backend\
xcopy /E /I /Y backend\src deploy-temp\backend\src\

REM Создаем архив
powershell -Command "Compress-Archive -Path 'deploy-temp\*' -DestinationPath 'water-counter-deploy.zip' -Force"

REM Удаляем временную папку
rmdir /s /q deploy-temp

echo ✅ Архив создан: water-counter-deploy.zip
echo 📦 Готов для загрузки на хостинг!
pause