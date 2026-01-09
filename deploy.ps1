# Автоматическое развертывание проекта на Vercel + Railway
# PowerShell версия с улучшенной обработкой ошибок

param(
    [switch]$SkipInstall,
    [switch]$Force,
    [string]$BackendUrl
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Автоматическое развертывание проекта" -ForegroundColor Cyan
Write-Host "   Frontend: Vercel" -ForegroundColor Cyan
Write-Host "   Backend: Railway" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Install-CLITools {
    Write-Host "[1/6] Проверка установленных инструментов..." -ForegroundColor Yellow
    
    if (-not (Test-Command "vercel")) {
        Write-Host "❌ Vercel CLI не установлен. Устанавливаем..." -ForegroundColor Red
        npm install -g vercel
        if ($LASTEXITCODE -ne 0) {
            throw "Ошибка установки Vercel CLI"
        }
    }
    
    if (-not (Test-Command "railway")) {
        Write-Host "❌ Railway CLI не установлен. Устанавливаем..." -ForegroundColor Red
        npm install -g @railway/cli
        if ($LASTEXITCODE -ne 0) {
            throw "Ошибка установки Railway CLI"
        }
    }
    
    Write-Host "✅ Все инструменты установлены" -ForegroundColor Green
}

function Install-Dependencies {
    if ($SkipInstall) {
        Write-Host "[2/6] Пропускаем установку зависимостей..." -ForegroundColor Yellow
        return
    }
    
    Write-Host "[2/6] Установка зависимостей..." -ForegroundColor Yellow
    
    Write-Host "📦 Устанавливаем зависимости frontend..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Ошибка установки зависимостей frontend"
    }
    
    Write-Host "📦 Устанавливаем зависимости backend..." -ForegroundColor Blue
    Push-Location backend
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "Ошибка установки зависимостей backend"
        }
    } finally {
        Pop-Location
    }
    
    Write-Host "✅ Зависимости установлены" -ForegroundColor Green
}

function Setup-Environment {
    Write-Host "[3/6] Проверка переменных окружения..." -ForegroundColor Yellow
    
    if (-not (Test-Path ".env")) {
        Write-Host "⚠️  Файл .env не найден. Создаем из примера..." -ForegroundColor Yellow
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
        } else {
            $envContent = "VITE_API_URL=http://localhost:3001`nVITE_GEMINI_API_KEY=your-gemini-api-key-here"
            $envContent | Out-File -FilePath ".env" -Encoding UTF8
        }
        Write-Host "⚠️  Пожалуйста, отредактируйте файл .env" -ForegroundColor Yellow
        if (-not $Force) {
            notepad .env
            Read-Host "Нажмите Enter после редактирования .env"
        }
    }
    
    if (-not (Test-Path "backend\.env")) {
        Write-Host "⚠️  Файл backend\.env не найден. Создаем..." -ForegroundColor Yellow
        $backendEnvContent = "PORT=3001`nJWT_SECRET=your-super-secret-jwt-key-here-$(Get-Random)`nNODE_ENV=production`nDATABASE_URL=./water_meter.db"
        $backendEnvContent | Out-File -FilePath "backend\.env" -Encoding UTF8
        
        if (-not $Force) {
            notepad "backend\.env"
            Read-Host "Нажмите Enter после редактирования backend\.env"
        }
    }
    
    Write-Host "✅ Переменные окружения настроены" -ForegroundColor Green
}

function Deploy-Backend {
    Write-Host "[4/6] Развертывание backend на Railway..." -ForegroundColor Yellow
    
    Push-Location backend
    try {
        Write-Host "🚂 Проверяем авторизацию в Railway..." -ForegroundColor Blue
        $authStatus = railway whoami 2>$null
        if ($LASTEXITCODE -ne 0 -or -not $authStatus) {
            Write-Host "🚂 Требуется авторизация в Railway..." -ForegroundColor Blue
            railway login
            if ($LASTEXITCODE -ne 0) {
                throw "Ошибка входа в Railway"
            }
        } else {
            Write-Host "✅ Уже авторизованы в Railway как: $authStatus" -ForegroundColor Green
        }
        
        Write-Host "🚂 Подключаемся к проекту или создаем новый..." -ForegroundColor Blue
        railway link
        if ($LASTEXITCODE -ne 0) {
            Write-Host "🚂 Создаем новый проект..." -ForegroundColor Blue
            railway init
            if ($LASTEXITCODE -ne 0) {
                throw "Ошибка создания проекта Railway"
            }
        }
        
        Write-Host "🚂 Деплоим backend..." -ForegroundColor Blue
        railway up
        if ($LASTEXITCODE -ne 0) {
            throw "Ошибка деплоя backend"
        }
        
        Write-Host "🚂 Получаем URL backend..." -ForegroundColor Blue
        $backendUrl = railway domain 2>$null
        if (-not $backendUrl -or $backendUrl -eq "") {
            Write-Host "⚠️  Не удалось получить URL backend автоматически" -ForegroundColor Yellow
            $backendUrl = Read-Host "Введите URL backend (например, https://your-app.railway.app)"
        }
        
        return $backendUrl.Trim()
    } finally {
        Pop-Location
    }
}

function Deploy-Frontend {
    param($BackendUrl)
    
    Write-Host "[5/6] Настройка frontend для production..." -ForegroundColor Yellow
    "VITE_API_URL=$BackendUrl" | Out-File -FilePath ".env.production" -Encoding UTF8
    
    Write-Host "[6/6] Развертывание frontend на Vercel..." -ForegroundColor Yellow
    
    Write-Host "🔺 Проверяем авторизацию в Vercel..." -ForegroundColor Blue
    $vercelAuth = vercel whoami 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $vercelAuth) {
        Write-Host "🔺 Требуется авторизация в Vercel..." -ForegroundColor Blue
        vercel login
        if ($LASTEXITCODE -ne 0) {
            throw "Ошибка входа в Vercel"
        }
    } else {
        Write-Host "✅ Уже авторизованы в Vercel как: $vercelAuth" -ForegroundColor Green
    }
    
    Write-Host "🔺 Деплоим frontend..." -ForegroundColor Blue
    vercel --prod --env "VITE_API_URL=$BackendUrl"
    if ($LASTEXITCODE -ne 0) {
        throw "Ошибка деплоя frontend"
    }
}

# Основной процесс
try {
    Install-CLITools
    Install-Dependencies
    Setup-Environment
    
    if ($BackendUrl) {
        $deployedBackendUrl = $BackendUrl
        Write-Host "✅ Используем предоставленный Backend URL: $deployedBackendUrl" -ForegroundColor Green
    } else {
        $deployedBackendUrl = Deploy-Backend
        Write-Host "✅ Backend развернут: $deployedBackendUrl" -ForegroundColor Green
    }
    
    Deploy-Frontend -BackendUrl $deployedBackendUrl
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Развертывание завершено успешно!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Backend URL: $deployedBackendUrl" -ForegroundColor Cyan
    Write-Host "🔗 Frontend URL: Смотрите вывод Vercel выше" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Следующие шаги:" -ForegroundColor Yellow
    Write-Host "1. Проверьте работу приложения" -ForegroundColor White
    Write-Host "2. Настройте домен (опционально)" -ForegroundColor White
    Write-Host "3. Настройте мониторинг" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "❌ Ошибка развертывания: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Проверьте логи выше для получения подробной информации" -ForegroundColor Yellow
    exit 1
}

Read-Host "Нажмите Enter для завершения"