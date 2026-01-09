@echo off
echo 🚀 Деплой фронтенда на Vercel...

echo 📦 Собираем проект...
npm run build

echo ⚡ Деплоим на Vercel...
vercel --prod

echo 🎉 Деплой завершен!
echo 📋 Не забудьте установить переменные окружения в Vercel Dashboard:
echo    VITE_API_URL = URL вашего бэкенда
echo    VITE_API_KEY = AIzaSyByIiReJxgKGGcOs_2v_i9a5fbF40X_JGc

pause