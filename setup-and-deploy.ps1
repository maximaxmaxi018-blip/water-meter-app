# Скрипт для установки Git и развертывания проекта
# Запускать от имени администратора

Write-Host "=== Установка и развертывание проекта ===" -ForegroundColor Green

# Проверяем, установлен ли Git
try {
    git --version
    Write-Host "Git уже установлен" -ForegroundColor Green
} catch {
    Write-Host "Git не найден. Необходимо установить Git вручную:" -ForegroundColor Yellow
    Write-Host "1. Скачайте Git с https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "2. Установите с настройками по умолчанию" -ForegroundColor Yellow
    Write-Host "3. Перезапустите PowerShell" -ForegroundColor Yellow
    Write-Host "4. Запустите этот скрипт снова" -ForegroundColor Yellow
    Read-Host "Нажмите Enter для выхода"
    exit
}

# Переходим в директорию проекта
Set-Location "c:\Users\Макс\Desktop\Ладога Строй\Счетчик воды\Вариант 2"

Write-Host "Текущая директория: $(Get-Location)" -ForegroundColor Cyan

# Проверяем, инициализирован ли Git репозиторий
if (-not (Test-Path ".git")) {
    Write-Host "Инициализируем Git репозиторий..." -ForegroundColor Yellow
    git init
    git branch -M main
} else {
    Write-Host "Git репозиторий уже инициализирован" -ForegroundColor Green
}

# Добавляем все файлы
Write-Host "Добавляем файлы в Git..." -ForegroundColor Yellow
git add .

# Делаем коммит
Write-Host "Создаем коммит..." -ForegroundColor Yellow
git commit -m "Initial commit with fixes"

# Запрашиваем данные GitHub репозитория
Write-Host "`n=== Настройка GitHub репозитория ===" -ForegroundColor Green
$username = Read-Host "Введите ваш GitHub username"
$reponame = Read-Host "Введите название репозитория (например: water-meter-app)"

# Добавляем remote origin
$repoUrl = "https://github.com/$username/$reponame.git"
Write-Host "Добавляем remote origin: $repoUrl" -ForegroundColor Yellow

try {
    git remote add origin $repoUrl
} catch {
    Write-Host "Remote origin уже существует, обновляем..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
}

# Пушим в GitHub
Write-Host "Загружаем код в GitHub..." -ForegroundColor Yellow
Write-Host "ВАЖНО: Убедитесь, что репозиторий $reponame создан на GitHub!" -ForegroundColor Red
Read-Host "Нажмите Enter, когда репозиторий будет создан"

git push -u origin main

Write-Host "`n=== Настройка vite.config.ts для GitHub Pages ===" -ForegroundColor Green

# Обновляем vite.config.ts
$viteConfig = @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/$reponame/', // Базовый путь для GitHub Pages
  build: {
    outDir: 'dist'
  }
})
"@

$viteConfig | Out-File -FilePath "vite.config.ts" -Encoding UTF8
Write-Host "vite.config.ts обновлен для GitHub Pages" -ForegroundColor Green

# Коммитим изменения
git add vite.config.ts
git commit -m "Update vite.config.ts for GitHub Pages"
git push

Write-Host "`n=== Инструкции для завершения развертывания ===" -ForegroundColor Green
Write-Host "1. Перейдите на https://render.com" -ForegroundColor Yellow
Write-Host "2. Создайте Web Service из вашего GitHub репозитория" -ForegroundColor Yellow
Write-Host "3. Настройки для Render:" -ForegroundColor Yellow
Write-Host "   - Name: water-meter-backend" -ForegroundColor Cyan
Write-Host "   - Environment: Node" -ForegroundColor Cyan
Write-Host "   - Build Command: npm install" -ForegroundColor Cyan
Write-Host "   - Start Command: npm start" -ForegroundColor Cyan
Write-Host "   - Root Directory: backend" -ForegroundColor Cyan
Write-Host "`n4. В настройках GitHub репозитория:" -ForegroundColor Yellow
Write-Host "   - Перейдите в Settings → Pages" -ForegroundColor Cyan
Write-Host "   - Source: GitHub Actions" -ForegroundColor Cyan
Write-Host "`n5. Ваш сайт будет доступен по адресу:" -ForegroundColor Yellow
Write-Host "   https://$username.github.io/$reponame" -ForegroundColor Cyan

Write-Host "`nРазвертывание завершено!" -ForegroundColor Green
Read-Host "Нажмите Enter для выхода"