# PowerShell скрипт для загрузки проекта в GitHub
Write-Host "🚀 Загрузка проекта в GitHub репозиторий..." -ForegroundColor Green
Write-Host ""

# Проверяем наличие Git
try {
    git --version | Out-Null
    Write-Host "✅ Git найден" -ForegroundColor Green
} catch {
    Write-Host "❌ ОШИБКА: Git не найден в системе!" -ForegroundColor Red
    Write-Host "Пожалуйста, установите Git с https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Инициализируем Git репозиторий
Write-Host "📁 Инициализация Git репозитория..." -ForegroundColor Cyan
git init

# Добавляем все файлы
Write-Host "📋 Добавление файлов..." -ForegroundColor Cyan
git add .

# Создаем первый коммит
Write-Host "💾 Создание коммита..." -ForegroundColor Cyan
git commit -m "Initial commit: Water meter application"

# Устанавливаем основную ветку
Write-Host "🌿 Установка основной ветки..." -ForegroundColor Cyan
git branch -M main

# Добавляем удаленный репозиторий
Write-Host "🔗 Добавление удаленного репозитория..." -ForegroundColor Cyan
git remote add origin https://github.com/maximaxmaxi018-blip/ptk-water.git

# Загружаем в GitHub
Write-Host "⬆️ Загрузка в GitHub..." -ForegroundColor Cyan
try {
    git push -u origin main
    Write-Host ""
    Write-Host "🎉 Готово! Проект успешно загружен в GitHub." -ForegroundColor Green
    Write-Host "🔗 Репозиторий: https://github.com/maximaxmaxi018-blip/ptk-water" -ForegroundColor Blue
    Write-Host ""
    Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
    Write-Host "1. Перейдите на https://railway.app для развертывания бэкенда" -ForegroundColor White
    Write-Host "2. Перейдите на https://vercel.com для развертывания фронтенда" -ForegroundColor White
    Write-Host "3. Следуйте инструкциям в README.md" -ForegroundColor White
} catch {
    Write-Host "❌ Ошибка при загрузке в GitHub!" -ForegroundColor Red
    Write-Host "Возможные причины:" -ForegroundColor Yellow
    Write-Host "- Репозиторий уже существует и не пустой" -ForegroundColor White
    Write-Host "- Нет прав доступа к репозиторию" -ForegroundColor White
    Write-Host "- Проблемы с аутентификацией GitHub" -ForegroundColor White
}

Write-Host ""
Read-Host "Нажмите Enter для выхода"