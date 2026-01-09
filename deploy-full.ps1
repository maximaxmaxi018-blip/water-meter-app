#!/usr/bin/env pwsh
# Автоматический деплой на Vercel + Railway
# Запуск: .\deploy-full.ps1

Write-Host "🚀 Начинаем автоматический деплой проекта..." -ForegroundColor Green

# Проверяем наличие необходимых CLI
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Проверяем Git
if (-not (Test-Command "git")) {
    Write-Host "❌ Git не найден. Установите Git и повторите попытку." -ForegroundColor Red
    exit 1
}

# Проверяем Node.js
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js не найден. Установите Node.js и повторите попытку." -ForegroundColor Red
    exit 1
}

# Проверяем npm
if (-not (Test-Command "npm")) {
    Write-Host "❌ npm не найден. Установите npm и повторите попытку." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Все необходимые инструменты найдены" -ForegroundColor Green

# Инициализируем Git репозиторий если его нет
if (-not (Test-Path ".git")) {
    Write-Host "📦 Инициализируем Git репозиторий..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit: Water meter management system"
}

# Устанавливаем зависимости фронтенда
Write-Host "📦 Устанавливаем зависимости фронтенда..." -ForegroundColor Yellow
npm install

# Устанавливаем зависимости бэкенда
Write-Host "📦 Устанавливаем зависимости бэкенда..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Проверяем/устанавливаем Vercel CLI
if (-not (Test-Command "vercel")) {
    Write-Host "📦 Устанавливаем Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Проверяем/устанавливаем Railway CLI
if (-not (Test-Command "railway")) {
    Write-Host "📦 Устанавливаем Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

Write-Host "🔧 Настраиваем конфигурацию..." -ForegroundColor Yellow

# Создаем .vercelignore если его нет
if (-not (Test-Path ".vercelignore")) {
    @"
backend/
*.db
.env
.env.local
node_modules/
.git/
"@ | Out-File -FilePath ".vercelignore" -Encoding UTF8
}

# Обновляем package.json для правильной сборки
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$packageJson.scripts.build = "vite build"
$packageJson.scripts.preview = "vite preview"
$packageJson | ConvertTo-Json -Depth 10 | Out-File "package.json" -Encoding UTF8

Write-Host "🚀 Деплоим фронтенд на Vercel..." -ForegroundColor Cyan

# Логинимся в Vercel (если не залогинены)
try {
    vercel whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "🔐 Необходимо войти в Vercel..." -ForegroundColor Yellow
        vercel login
    }
} catch {
    Write-Host "🔐 Необходимо войти в Vercel..." -ForegroundColor Yellow
    vercel login
}

# Деплоим на Vercel
Write-Host "📤 Загружаем фронтенд на Vercel..." -ForegroundColor Cyan
vercel --prod --yes

Write-Host "🚀 Деплоим бэкенд на Railway..." -ForegroundColor Magenta

# Логинимся в Railway (если не залогинены)
try {
    railway whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "🔐 Необходимо войти в Railway..." -ForegroundColor Yellow
        railway login
    }
} catch {
    Write-Host "🔐 Необходимо войти в Railway..." -ForegroundColor Yellow
    railway login
}

# Создаем проект Railway если его нет
try {
    railway status 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "📦 Создаем новый проект Railway..." -ForegroundColor Yellow
        railway project new
    }
} catch {
    Write-Host "📦 Создаем новый проект Railway..." -ForegroundColor Yellow
    railway project new
}

# Деплоим на Railway
Write-Host "📤 Загружаем бэкенд на Railway..." -ForegroundColor Magenta
railway up

Write-Host "🎉 Деплой завершен!" -ForegroundColor Green
Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
Write-Host "1. Скопируйте URL бэкенда из Railway Dashboard" -ForegroundColor White
Write-Host "2. Обновите переменную VITE_API_URL в настройках Vercel" -ForegroundColor White
Write-Host "3. Перезапустите деплой фронтенда: vercel --prod" -ForegroundColor White

# Показываем ссылки
Write-Host "`n🔗 Полезные ссылки:" -ForegroundColor Cyan
Write-Host "Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Blue
Write-Host "Railway Dashboard: https://railway.app/dashboard" -ForegroundColor Blue

Write-Host "`n✅ Автоматический деплой завершен успешно!" -ForegroundColor Green