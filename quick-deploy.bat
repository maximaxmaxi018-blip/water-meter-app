@echo off
echo Деплой на GitHub Pages...

echo Добавляем все файлы в git...
git add .

echo Создаем коммит...
set /p commit_message="Введите сообщение коммита (или нажмите Enter для 'Update site'): "
if "%commit_message%"=="" set commit_message=Update site

git commit -m "%commit_message%"

echo Отправляем на GitHub...
git push origin main

echo.
echo Деплой запущен! Проверьте статус на:
echo https://github.com/maximaxmaxi018-blip/water-meter-app/actions
echo.
echo Сайт будет доступен через несколько минут на:
echo https://maximaxmaxi018-blip.github.io/water-meter-app/
echo.
pause