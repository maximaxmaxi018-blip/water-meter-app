# 🚀 Простой деплой без Git
Write-Host "🚀 Начинаем развертывание проекта..." -ForegroundColor Green

# Проверяем Node.js
Write-Host "📋 Проверяем Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js найден: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js не найден. Установите Node.js с https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Устанавливаем зависимости фронтенда
Write-Host "📦 Устанавливаем зависимости фронтенда..." -ForegroundColor Yellow
npm install

# Устанавливаем зависимости бэкенда
Write-Host "📦 Устанавливаем зависимости бэкенда..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Создаем production build фронтенда
Write-Host "🔨 Создаем production build..." -ForegroundColor Yellow
npm run build

Write-Host "✅ Проект готов к развертыванию!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Зарегистрируйтесь на https://railway.app для бэкенда" -ForegroundColor White
Write-Host "2. Зарегистрируйтесь на https://vercel.com для фронтенда" -ForegroundColor White
Write-Host "3. Загрузите папку 'backend' на Railway" -ForegroundColor White
Write-Host "4. Загрузите папку 'dist' на Vercel" -ForegroundColor White
Write-Host ""
Write-Host "📁 Файлы готовы в папках:" -ForegroundColor Yellow
Write-Host "   - backend/ (для Railway)" -ForegroundColor White
Write-Host "   - dist/ (для Vercel)" -ForegroundColor White