# Скрипт развертывания проекта счетчика воды
# Запуск: .\deploy.ps1

param(
    [string]$GitHubUsername = "",
    [string]$RepoName = "water-meter-app"
)

Write-Host "🚀 Начинаем развертывание проекта..." -ForegroundColor Green

# Проверка Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git не установлен! Скачайте с https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

# Запрос имени пользователя GitHub если не указано
if ([string]::IsNullOrEmpty($GitHubUsername)) {
    $GitHubUsername = Read-Host "Введите ваше имя пользователя GitHub"
}

Write-Host "📁 Переходим в директорию проекта..." -ForegroundColor Yellow
Set-Location "c:\Users\Макс\Desktop\Ладога Строй\Счетчик воды\Вариант 2"

# Инициализация Git репозитория
Write-Host "🔧 Инициализируем Git репозиторий..." -ForegroundColor Yellow
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Добавление удаленного репозитория
$repoUrl = "https://github.com/$GitHubUsername/$RepoName.git"
Write-Host "🔗 Подключаем к GitHub репозиторию: $repoUrl" -ForegroundColor Yellow
git remote add origin $repoUrl

# Создание GitHub Actions workflow
Write-Host "⚙️ Создаем GitHub Actions workflow..." -ForegroundColor Yellow
$workflowDir = ".github\workflows"
if (-not (Test-Path $workflowDir)) {
    New-Item -ItemType Directory -Path $workflowDir -Force
}

$workflowContent = @"
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_API_URL: https://$RepoName.onrender.com/api
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: `${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
"@

$workflowContent | Out-File -FilePath "$workflowDir\deploy.yml" -Encoding UTF8

# Обновление vite.config.ts для GitHub Pages
Write-Host "🔧 Обновляем конфигурацию Vite..." -ForegroundColor Yellow
$viteConfig = @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/$RepoName/',
  build: {
    outDir: 'dist'
  }
})
"@

$viteConfig | Out-File -FilePath "vite.config.ts" -Encoding UTF8

# Коммит изменений
Write-Host "💾 Сохраняем изменения..." -ForegroundColor Yellow
git add .
git commit -m "Add GitHub Pages deployment configuration"

# Push в GitHub
Write-Host "📤 Отправляем код в GitHub..." -ForegroundColor Yellow
try {
    git push -u origin main
    Write-Host "✅ Код успешно отправлен в GitHub!" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка при отправке в GitHub. Убедитесь, что:" -ForegroundColor Red
    Write-Host "   1. Репозиторий $repoUrl существует" -ForegroundColor Red
    Write-Host "   2. У вас есть права доступа к репозиторию" -ForegroundColor Red
    Write-Host "   3. Вы авторизованы в Git (git config user.name и user.email)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 СЛЕДУЮЩИЕ ШАГИ:" -ForegroundColor Cyan
Write-Host "1. Перейдите на https://github.com/$GitHubUsername/$RepoName" -ForegroundColor White
Write-Host "2. Включите GitHub Pages: Settings → Pages → Source: GitHub Actions" -ForegroundColor White
Write-Host "3. Создайте бэкенд на Render.com с именем '$RepoName'" -ForegroundColor White
Write-Host ""
Write-Host "🌐 ССЫЛКИ:" -ForegroundColor Cyan
Write-Host "   Фронтенд: https://$GitHubUsername.github.io/$RepoName" -ForegroundColor White
Write-Host "   Бэкенд:   https://$RepoName.onrender.com" -ForegroundColor White
Write-Host ""
Write-Host "⚡ GitHub Actions автоматически развернет сайт после push!" -ForegroundColor Yellow