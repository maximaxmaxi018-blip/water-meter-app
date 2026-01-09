# Скрипт для инициализации Git репозитория
# Использование: .\init-git.ps1

Write-Host "🚀 Инициализация Git репозитория..." -ForegroundColor Green

# Проверяем, установлен ли Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git не установлен. Пожалуйста, установите Git с https://git-scm.com" -ForegroundColor Red
    exit 1
}

# Инициализируем репозиторий
Write-Host "📦 Инициализирую Git..." -ForegroundColor Cyan
git init

# Добавляем все файлы
Write-Host "📝 Добавляю файлы..." -ForegroundColor Cyan
git add .

# Создаем первый коммит
Write-Host "💾 Создаю первый коммит..." -ForegroundColor Cyan
git commit -m "Initial commit"

# Переименовываем ветку в main
Write-Host "🌿 Переименовываю ветку в main..." -ForegroundColor Cyan
git branch -M main

# Просим пользователя ввести URL репозитория
Write-Host ""
Write-Host "📍 Введите URL вашего GitHub репозитория:" -ForegroundColor Yellow
Write-Host "   Пример: https://github.com/YOUR_USERNAME/water-meter-app.git" -ForegroundColor Gray
$repoUrl = Read-Host "URL"

if ($repoUrl) {
    Write-Host "🔗 Добавляю удаленный репозиторий..." -ForegroundColor Cyan
    git remote add origin $repoUrl
    
    Write-Host "📤 Отправляю на GitHub..." -ForegroundColor Cyan
    git push -u origin main
    
    Write-Host ""
    Write-Host "✅ Git репозиторий успешно создан!" -ForegroundColor Green
    Write-Host "📍 Репозиторий: $repoUrl" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Вы не ввели URL репозитория." -ForegroundColor Yellow
    Write-Host "Позже вы можете добавить его командой:" -ForegroundColor Gray
    Write-Host "   git remote add origin <URL>" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📖 Дальше следуйте инструкциям в QUICK_DEPLOY.md" -ForegroundColor Green
