@echo off
echo Быстрая загрузка обновлений на GitHub...
echo.

REM Проверяем наличие Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ОШИБКА: Git не найден! Установите Git с https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Если репозиторий не инициализирован
if not exist .git (
    echo Инициализация Git репозитория...
    git init
    git branch -M main
    git remote add origin https://github.com/maximaxmaxi018-blip/ptk-water.git
)

REM Добавляем все изменения
echo Добавление изменений...
git add .

REM Создаем коммит с текущей датой
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "datestamp=%DD%.%MM%.%YYYY% %HH%:%Min%"

git commit -m "Обновление от %datestamp%"

REM Загружаем на GitHub
echo Загрузка на GitHub...
git push -u origin main

echo.
echo ✅ Готово! Изменения загружены на GitHub
echo 🌐 Netlify автоматически обновит сайт в течение 1-2 минут
echo 📱 Проверьте: https://voda-pit.netlify.app/
echo.
pause