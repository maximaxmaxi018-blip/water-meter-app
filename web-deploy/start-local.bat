@echo off
echo ========================================
echo   Локальный запуск приложения
echo ========================================

echo [1/2] Запуск бэкенда...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Запуск фронтенда...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Приложение запускается...
echo 📱 Фронтенд: http://localhost:3000
echo 🔧 Бэкенд: http://localhost:5000
echo.
echo Нажмите любую клавишу для выхода...
pause >nul