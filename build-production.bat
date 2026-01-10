@echo off
echo Установка зависимостей...
npm install

echo Сборка проекта...
npm run build

echo Готово! Проект собран в папку dist/
pause