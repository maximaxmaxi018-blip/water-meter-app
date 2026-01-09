#!/usr/bin/env pwsh

# Скрипт автоматического развертывания проекта
# Бэкенд: Render.com, Фронтенд: GitHub Pages

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$true)]
    [string]$RepoName,
    
    [Parameter(Mandatory=$false)]
    [string]$RenderBackendUrl = ""
)

# Цвета для вывода
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-Step {
    param([string]$Message)
    Write-Host "🔄 $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor $Yellow
}

# Проверка наличия Git
Write-Step "Проверка наличия Git..."
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git не установлен. Установите Git и повторите попытку."
    exit 1
}
Write-Success "Git найден"

# Проверка наличия Node.js
Write-Step "Проверка наличия Node.js..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js не установлен. Установите Node.js и повторите попытку."
    exit 1
}
Write-Success "Node.js найден"

# Переход в директорию проекта
$ProjectPath = "c:\Users\Макс\Desktop\Ладога Строй\Счетчик воды\Вариант 2"
Set-Location $ProjectPath

Write-Step "Инициализация Git репозитория..."
if (-not (Test-Path ".git")) {
    git init
    Write-Success "Git репозиторий инициализирован"
} else {
    Write-Success "Git репозиторий уже существует"
}

# Создание .gitignore если не существует
Write-Step "Создание .gitignore..."
$GitIgnoreContent = @"
node_modules/
dist/
.env
.env.local
.env.production
*.log
.DS_Store
Thumbs.db
"@

if (-not (Test-Path ".gitignore")) {
    $GitIgnoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Success ".gitignore создан"
} else {
    Write-Success ".gitignore уже существует"
}

# Создание GitHub Actions workflow
Write-Step "Создание GitHub Actions workflow..."
$WorkflowDir = ".github\workflows"
if (-not (Test-Path $WorkflowDir)) {
    New-Item -ItemType Directory -Path $WorkflowDir -Force | Out-Null
}

$BackendUrl = if ($RenderBackendUrl) { $RenderBackendUrl } else { "https://$RepoName-backend.onrender.com/api" }

$WorkflowContent = @"
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
        VITE_API_URL: $BackendUrl
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: `${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
"@

$WorkflowContent | Out-File -FilePath "$WorkflowDir\deploy.yml" -Encoding UTF8
Write-Success "GitHub Actions workflow создан"

# Обновление vite.config.ts
Write-Step "Обновление vite.config.ts..."
$ViteConfigContent = @"
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

$ViteConfigContent | Out-File -FilePath "vite.config.ts" -Encoding UTF8
Write-Success "vite.config.ts обновлен"

# Добавление всех файлов в Git
Write-Step "Добавление файлов в Git..."
git add .
Write-Success "Файлы добавлены"

# Создание коммита
Write-Step "Создание коммита..."
git commit -m "Initial commit with deployment configuration"
Write-Success "Коммит создан"

# Настройка удаленного репозитория
Write-Step "Настройка удаленного репозитория..."
$RemoteUrl = "https://github.com/$GitHubUsername/$RepoName.git"
git branch -M main

# Проверка существования remote origin
$ExistingRemote = git remote get-url origin 2>$null
if ($ExistingRemote) {
    git remote set-url origin $RemoteUrl
    Write-Success "Remote origin обновлен"
} else {
    git remote add origin $RemoteUrl
    Write-Success "Remote origin добавлен"
}

# Push в GitHub
Write-Step "Отправка кода в GitHub..."
try {
    git push -u origin main
    Write-Success "Код отправлен в GitHub"
} catch {
    Write-Warning "Не удалось отправить код. Убедитесь, что:"
    Write-Host "1. Репозиторий $RemoteUrl существует" -ForegroundColor $Yellow
    Write-Host "2. У вас есть права на запись в репозиторий" -ForegroundColor $Yellow
    Write-Host "3. Вы авторизованы в Git (git config user.name и user.email)" -ForegroundColor $Yellow
}

# Создание render.yaml для автоматического развертывания на Render
Write-Step "Создание render.yaml..."
$RenderConfigContent = @"
services:
  - type: web
    name: $RepoName-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
"@

$RenderConfigContent | Out-File -FilePath "render.yaml" -Encoding UTF8
Write-Success "render.yaml создан"

# Финальный коммит с render.yaml
git add render.yaml
git commit -m "Add render.yaml for automatic deployment"
git push

Write-Host "`n🎉 Развертывание настроено!" -ForegroundColor $Green
Write-Host "`n📋 Следующие шаги:" -ForegroundColor $Blue
Write-Host "1. Создайте репозиторий на GitHub: https://github.com/new" -ForegroundColor $Yellow
Write-Host "   Имя репозитория: $RepoName" -ForegroundColor $Yellow
Write-Host "`n2. Настройте Render.com:" -ForegroundColor $Yellow
Write-Host "   - Перейдите на https://render.com" -ForegroundColor $Yellow
Write-Host "   - New → Web Service" -ForegroundColor $Yellow
Write-Host "   - Подключите репозиторий: $RemoteUrl" -ForegroundColor $Yellow
Write-Host "`n3. Настройте GitHub Pages:" -ForegroundColor $Yellow
Write-Host "   - Settings → Pages → Source: GitHub Actions" -ForegroundColor $Yellow
Write-Host "`n4. Ваш сайт будет доступен по адресу:" -ForegroundColor $Yellow
Write-Host "   https://$GitHubUsername.github.io/$RepoName" -ForegroundColor $Green

Write-Host "`n🔗 Полезные ссылки:" -ForegroundColor $Blue
Write-Host "GitHub репозиторий: $RemoteUrl" -ForegroundColor $Yellow
Write-Host "Render Dashboard: https://dashboard.render.com" -ForegroundColor $Yellow
Write-Host "GitHub Actions: https://github.com/$GitHubUsername/$RepoName/actions" -ForegroundColor $Yellow