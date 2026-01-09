# Автоматический деплой на Vercel + Railway
# Убедитесь, что у вас установлены Vercel CLI и Railway CLI

Write-Host "🚀 Начинаем автоматический деплой..." -ForegroundColor Green

# Проверяем наличие CLI инструментов
Write-Host "📋 Проверяем CLI инструменты..." -ForegroundColor Yellow

# Проверяем Vercel CLI
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI найден: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI не найден. Устанавливаем..." -ForegroundColor Red
    npm install -g vercel
}

# Проверяем Railway CLI
try {
    $railwayVersion = railway version
    Write-Host "✅ Railway CLI найден: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI не найден. Устанавливаем..." -ForegroundColor Red
    npm install -g @railway/cli
}

# Проверяем Git репозиторий
if (-not (Test-Path ".git")) {
    Write-Host "📦 Инициализируем Git репозиторий..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for deployment"
}

Write-Host "🔧 Настраиваем переменные окружения..." -ForegroundColor Yellow

# Создаем .env для продакшена если его нет
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Создан .env файл из примера" -ForegroundColor Green
}

# Деплой бэкенда на Railway
Write-Host "🚂 Деплоим бэкенд на Railway..." -ForegroundColor Cyan
Set-Location "backend"

# Логинимся в Railway (если не залогинены)
try {
    railway whoami
} catch {
    Write-Host "🔐 Необходимо войти в Railway..." -ForegroundColor Yellow
    railway login
}

# Создаем новый проект или подключаемся к существующему
Write-Host "📋 Создаем проект на Railway..." -ForegroundColor Yellow
railway project new

# Устанавливаем переменные окружения для Railway
Write-Host "⚙️ Настраиваем переменные окружения Railway..." -ForegroundColor Yellow
railway variables set NODE_ENV=production
railway variables set PORT=3000
$jwtSecret = -join ((1..32) | ForEach {[char]((65..90) + (97..122) + (48..57) | Get-Random)})
railway variables set JWT_SECRET=$jwtSecret

# Деплоим бэкенд
Write-Host "🚀 Деплоим бэкенд..." -ForegroundColor Green
railway up --detach

# Получаем URL бэкенда
$backendUrl = railway domain
Write-Host "✅ Бэкенд развернут: $backendUrl" -ForegroundColor Green

Set-Location ".."

# Деплой фронтенда на Vercel
Write-Host "⚡ Деплоим фронтенд на Vercel..." -ForegroundColor Cyan

# Логинимся в Vercel (если не залогинены)
try {
    vercel whoami
} catch {
    Write-Host "🔐 Необходимо войти в Vercel..." -ForegroundColor Yellow
    vercel login
}

# Устанавливаем переменную окружения для API URL
Write-Host "⚙️ Настраиваем переменные окружения Vercel..." -ForegroundColor Yellow
if ($backendUrl) {
    vercel env add VITE_API_URL production
    Write-Host "Введите URL бэкенда: $backendUrl"
}

# Деплоим фронтенд
Write-Host "🚀 Деплоим фронтенд..." -ForegroundColor Green
vercel --prod

Write-Host "🎉 Деплой завершен!" -ForegroundColor Green
Write-Host "📋 Проверьте ваши приложения:" -ForegroundColor Yellow
Write-Host "   🚂 Бэкенд (Railway): $backendUrl" -ForegroundColor Cyan
Write-Host "   ⚡ Фронтенд (Vercel): проверьте вывод команды выше" -ForegroundColor Cyan

Write-Host "💡 Не забудьте обновить VITE_API_URL в настройках Vercel!" -ForegroundColor Yellow