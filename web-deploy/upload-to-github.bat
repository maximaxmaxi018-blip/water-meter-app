@echo off
echo Загрузка проекта в GitHub репозиторий...
echo.

REM Проверяем наличие Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ОШИБКА: Git не найден в системе!
    echo Пожалуйста, установите Git с https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Инициализируем Git репозиторий
echo Инициализация Git репозитория...
git init

REM Добавляем все файлы
echo Добавление файлов...
git add .

REM Создаем первый коммит
echo Создание коммита...
git commit -m "Initial commit: Water meter application"

REM Устанавливаем основную ветку
echo Установка основной ветки...
git branch -M main

REM Добавляем удаленный репозиторий
echo Добавление удаленного репозитория...
git remote add origin https://github.com/maximaxmaxi018-blip/ptk-water.git

REM Загружаем в GitHub
echo Загрузка в GitHub...
git push -u origin main

echo.
echo Готово! Проект загружен в GitHub.
echo Репозиторий: https://github.com/maximaxmaxi018-blip/ptk-water
echo.
pause