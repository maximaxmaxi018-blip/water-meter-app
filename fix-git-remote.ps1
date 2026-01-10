# Исправление URL удаленного репозитория
Write-Host "Исправляем URL удаленного репозитория..."

# Удаляем старый remote
git remote remove origin

# Добавляем правильный remote
git remote add origin https://github.com/maximaxmaxi018-blip/water-meter-app.git

# Проверяем
git remote -v

Write-Host "URL репозитория исправлен!"
Write-Host "Теперь выполните: git push -u origin main"