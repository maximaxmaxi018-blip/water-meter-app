#!/usr/bin/env powershell

Write-Host "🚀 Автоматическое развертывание проекта в интернете" -ForegroundColor Green

# Создаем временную папку для деплоя
$deployPath = "web-deploy"
if (Test-Path $deployPath) {
    Remove-Item -Recurse -Force $deployPath
}
New-Item -ItemType Directory -Path $deployPath

# Копируем необходимые файлы
Write-Host "📦 Подготавливаем файлы для деплоя..." -ForegroundColor Yellow

# Frontend файлы
Copy-Item "package.json" "$deployPath/"
Copy-Item "vite.config.ts" "$deployPath/"
Copy-Item "tsconfig.json" "$deployPath/"
Copy-Item "index.html" "$deployPath/"
Copy-Item "vercel.json" "$deployPath/"
Copy-Item ".env.example" "$deployPath/"

# Создаем src структуру
New-Item -ItemType Directory -Path "$deployPath/src" -Force
Copy-Item "App.tsx" "$deployPath/src/"
Copy-Item "index.tsx" "$deployPath/src/"
Copy-Item "types.ts" "$deployPath/src/"
Copy-Item "constants.tsx" "$deployPath/src/"

# Копируем компоненты, страницы, сервисы
Copy-Item -Recurse "components" "$deployPath/"
Copy-Item -Recurse "pages" "$deployPath/"
Copy-Item -Recurse "services" "$deployPath/"

# Backend файлы
Copy-Item -Recurse "backend" "$deployPath/"

# Создаем .gitignore
@"
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
"@ | Out-File -FilePath "$deployPath/.gitignore" -Encoding UTF8

# Создаем README для деплоя
@"
# Water Counter App

## Быстрый деплой

### Backend (Railway)
1. Перейдите на https://railway.app
2. Создайте новый проект из GitHub
3. Выберите папку backend
4. Добавьте переменные окружения:
   - PORT: 3000
   - NODE_ENV: production

### Frontend (Vercel)
1. Перейдите на https://vercel.com
2. Импортируйте проект из GitHub
3. Добавьте переменную окружения:
   - VITE_API_URL: [URL вашего Railway бэкенда]

## Тестовые данные
- Админ: admin / admin123
- Пользователь: user1 / password123
"@ | Out-File -FilePath "$deployPath/README.md" -Encoding UTF8

Write-Host "✅ Файлы подготовлены в папке: $deployPath" -ForegroundColor Green

# Открываем GitHub для создания репозитория
Write-Host "🌐 Открываю GitHub для создания репозитория..." -ForegroundColor Cyan
Start-Process "https://github.com/new"

Write-Host ""
Write-Host "📋 ИНСТРУКЦИИ ДЛЯ ЗАВЕРШЕНИЯ ДЕПЛОЯ:" -ForegroundColor Yellow
Write-Host "1. Создайте новый репозиторий на GitHub (откроется автоматически)"
Write-Host "2. Загрузите содержимое папки '$deployPath' в репозиторий"
Write-Host "3. Перейдите на https://railway.app и подключите репозиторий"
Write-Host "4. Перейдите на https://vercel.com и подключите репозиторий"
Write-Host ""
Write-Host "🎯 После деплоя ваше приложение будет доступно в интернете!" -ForegroundColor Green

# Создаем архив для удобной загрузки
Write-Host "📦 Создаю архив для загрузки..." -ForegroundColor Yellow
Compress-Archive -Path "$deployPath\*" -DestinationPath "water-counter-web-deploy.zip" -Force

Write-Host "✅ Архив создан: water-counter-web-deploy.zip" -ForegroundColor Green
Write-Host "📤 Загрузите этот архив на GitHub или распакуйте и загрузите файлы" -ForegroundColor Cyan

# Открываем папку с файлами
explorer $deployPath

Read-Host "Нажмите Enter для завершения"