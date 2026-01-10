# Скрипт развертывания проекта на GitHub
param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$true)]
    [string]$RepoName = "water-meter-app"
)

Write-Host "🚀 Начинаем развертывание проекта..." -ForegroundColor Green

# Проверка установки Git
try {
    git --version | Out-Null
    Write-Host "✅ Git установлен" -ForegroundColor Green
} catch {
    Write-Host "❌ Git не установлен. Скачайте с https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

# Переход в директорию проекта
Set-Location "c:\Users\Макс\Desktop\Ладога Строй\Счетчик воды\Вариант 2"

# Инициализация Git репозитория
Write-Host "📁 Инициализация Git репозитория..." -ForegroundColor Yellow
git init

# Добавление всех файлов
Write-Host "📄 Добавление файлов..." -ForegroundColor Yellow
git add .

# Создание первого коммита
Write-Host "💾 Создание коммита..." -ForegroundColor Yellow
git commit -m "Initial commit: Water meter management system"

# Переименование ветки в main
git branch -M main

# Добавление удаленного репозитория
$repoUrl = "https://github.com/$GitHubUsername/$RepoName.git"
Write-Host "🔗 Подключение к репозиторию: $repoUrl" -ForegroundColor Yellow
git remote add origin $repoUrl

# Загрузка на GitHub
Write-Host "⬆️ Загрузка на GitHub..." -ForegroundColor Yellow
try {
    git push -u origin main
    Write-Host "✅ Проект успешно загружен на GitHub!" -ForegroundColor Green
    Write-Host "🌐 Репозиторий: $repoUrl" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ошибка загрузки. Убедитесь, что:" -ForegroundColor Red
    Write-Host "   1. Репозиторий создан на GitHub" -ForegroundColor Red
    Write-Host "   2. У вас есть права доступа" -ForegroundColor Red
    Write-Host "   3. Вы авторизованы в Git" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Развертывание завершено!" -ForegroundColor Green
Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
Write-Host "   1. Перейдите на Render.com для развертывания бэкенда" -ForegroundColor White
Write-Host "   2. Настройте GitHub Pages в настройках репозитория" -ForegroundColor White
Write-Host "   3. Ваш сайт будет доступен по адресу:" -ForegroundColor White
Write-Host "      https://$GitHubUsername.github.io/$RepoName" -ForegroundColor Cyan