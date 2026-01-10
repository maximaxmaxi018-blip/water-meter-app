# Скрипт быстрого обновления проекта
param(
    [string]$CommitMessage = "Update project files"
)

Write-Host "🔄 Обновление проекта на GitHub..." -ForegroundColor Green

# Переход в директорию проекта
Set-Location "c:\Users\Макс\Desktop\Ладога Строй\Счетчик воды\Вариант 2"

# Добавление изменений
Write-Host "📄 Добавление изменений..." -ForegroundColor Yellow
git add .

# Проверка наличия изменений
$status = git status --porcelain
if (-not $status) {
    Write-Host "ℹ️ Нет изменений для загрузки" -ForegroundColor Blue
    exit 0
}

# Создание коммита
Write-Host "💾 Создание коммита: $CommitMessage" -ForegroundColor Yellow
git commit -m $CommitMessage

# Загрузка изменений
Write-Host "⬆️ Загрузка изменений..." -ForegroundColor Yellow
try {
    git push
    Write-Host "✅ Изменения успешно загружены!" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка загрузки изменений" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Обновление завершено!" -ForegroundColor Green