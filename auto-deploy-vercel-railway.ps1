# Автоматический деплой на Vercel + Railway
Write-Host "🚀 Начинаем автоматический деплой..." -ForegroundColor Green

# Проверяем наличие необходимых CLI
Write-Host "📋 Проверяем CLI инструменты..." -ForegroundColor Yellow

# Проверяем Vercel CLI
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI найден" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI не найден. Устанавливаем..." -ForegroundColor Red
    npm install -g vercel
}

# Проверяем Railway CLI
try {
    railway version | Out-Null
    Write-Host "✅ Railway CLI найден" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI не найден. Устанавливаем..." -ForegroundColor Red
    npm install -g @railway/cli
}

# Устанавливаем зависимости фронтенда
Write-Host "📦 Устанавливаем зависимости фронтенда..." -ForegroundColor Yellow
npm install

# Устанавливаем зависимости бэкенда
Write-Host "📦 Устанавливаем зависимости бэкенда..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Деплой бэкенда на Railway
Write-Host "🚂 Деплоим бэкенд на Railway..." -ForegroundColor Cyan
railway login
railway link
railway up

# Получаем URL Railway для настройки фронтенда
Write-Host "🔗 Получаем URL Railway..." -ForegroundColor Yellow
$railwayUrl = railway status --json | ConvertFrom-Json | Select-Object -ExpandProperty url

if ($railwayUrl) {
    Write-Host "✅ Railway URL: $railwayUrl" -ForegroundColor Green
    
    # Обновляем vercel.json с правильным API URL
    $vercelConfig = Get-Content "vercel.json" | ConvertFrom-Json
    $vercelConfig.env.VITE_API_URL = $railwayUrl
    $vercelConfig | ConvertTo-Json -Depth 10 | Set-Content "vercel.json"
    
    Write-Host "✅ Обновлен vercel.json с Railway URL" -ForegroundColor Green
} else {
    Write-Host "⚠️ Не удалось получить Railway URL. Используем заглушку." -ForegroundColor Yellow
}

# Деплой фронтенда на Vercel
Write-Host "⚡ Деплоим фронтенд на Vercel..." -ForegroundColor Cyan
vercel login
vercel --prod

Write-Host "🎉 Деплой завершен!" -ForegroundColor Green
Write-Host "📱 Фронтенд: https://your-app.vercel.app" -ForegroundColor Cyan
Write-Host "🔧 Бэкенд: $railwayUrl" -ForegroundColor Cyan