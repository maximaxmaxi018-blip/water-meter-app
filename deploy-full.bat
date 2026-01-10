@echo off
echo ========================================
echo    РАЗВЕРТЫВАНИЕ СЧЕТЧИКА ВОДЫ
echo ========================================
echo.

echo 1. Установка зависимостей...
call npm install
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось установить зависимости
    pause
    exit /b 1
)

echo.
echo 2. Сборка проекта...
call npm run build
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось собрать проект
    pause
    exit /b 1
)

echo.
echo ========================================
echo    СБОРКА ЗАВЕРШЕНА УСПЕШНО!
echo ========================================
echo.
echo Файлы готовы для развертывания в папке 'dist'
echo.
echo Следующие шаги:
echo 1. Загрузите код в GitHub репозиторий
echo 2. Настройте GitHub Pages
echo 3. Для локального тестирования запустите: serve-local.bat
echo.
echo Нажмите любую клавишу для выхода...
pause >nul