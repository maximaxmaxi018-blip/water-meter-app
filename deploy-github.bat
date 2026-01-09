@echo off
echo Сборка проекта для GitHub Pages...
call npm run build

echo Копирование файлов в gh-pages ветку...
git checkout -B gh-pages
xcopy /E /Y dist\* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force
git checkout main

echo ✅ Развертывание завершено!
echo 🌐 Сайт будет доступен по адресу: https://maximaxmaxi018-blip.github.io/ptk-water/
pause