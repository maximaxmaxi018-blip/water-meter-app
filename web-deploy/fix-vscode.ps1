#!/usr/bin/env pwsh
# Исправление ошибки VSCode: "Failed to execute button action"

Write-Host "🔧 Исправляем ошибку VSCode Amazon Q..." -ForegroundColor Yellow

# Закрываем VSCode
Write-Host "1. Закрываем VSCode..." -ForegroundColor Cyan
Get-Process "Code" -ErrorAction SilentlyContinue | Stop-Process -Force

# Очищаем кэш расширений
Write-Host "2. Очищаем кэш расширений..." -ForegroundColor Cyan
$extensionPath = "$env:USERPROFILE\.vscode\extensions"
$cachePath = "$env:USERPROFILE\.vscode\CachedExtensions"

if (Test-Path $cachePath) {
    Remove-Item $cachePath -Recurse -Force
    Write-Host "   ✅ Кэш расширений очищен" -ForegroundColor Green
}

# Очищаем временные файлы Amazon Q
Write-Host "3. Очищаем временные файлы Amazon Q..." -ForegroundColor Cyan
$amazonQPaths = @(
    "$env:USERPROFILE\.aws\amazonq",
    "$env:APPDATA\Code\User\workspaceStorage",
    "$env:APPDATA\Code\logs"
)

foreach ($path in $amazonQPaths) {
    if (Test-Path $path) {
        Get-ChildItem $path -Recurse -Filter "*amazonq*" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
        Get-ChildItem $path -Recurse -Filter "*deferred*" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
    }
}

# Перезапускаем VSCode
Write-Host "4. Перезапускаем VSCode..." -ForegroundColor Cyan
Start-Sleep 2
Start-Process "code" -ArgumentList "."

Write-Host "✅ Исправление завершено!" -ForegroundColor Green
Write-Host "📋 Если ошибка повторится:" -ForegroundColor Yellow
Write-Host "   1. Отключите расширение Amazon Q" -ForegroundColor White
Write-Host "   2. Перезапустите VSCode" -ForegroundColor White
Write-Host "   3. Включите расширение обратно" -ForegroundColor White