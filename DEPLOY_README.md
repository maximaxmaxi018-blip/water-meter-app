# Автоматическое развертывание - Инструкция

## Быстрый запуск

1. **Откройте PowerShell от имени администратора**

2. **Выполните команду:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

3. **Запустите скрипт:**
```powershell
.\deploy.ps1 -GitHubUsername "ВАШ_GITHUB_USERNAME" -RepoName "water-meter-app"
```

**Пример:**
```powershell
.\deploy.ps1 -GitHubUsername "maksim123" -RepoName "water-meter-app"
```

## Что делает скрипт автоматически:

✅ Инициализирует Git репозиторий  
✅ Создает .gitignore  
✅ Настраивает GitHub Actions для автоматического развертывания  
✅ Обновляет vite.config.ts для GitHub Pages  
✅ Создает render.yaml для Render.com  
✅ Делает коммит и пуш в GitHub  

## После запуска скрипта:

1. **Создайте репозиторий на GitHub** (имя должно совпадать с параметром RepoName)
2. **Настройте Render.com:**
   - Зайдите на https://render.com
   - New → Web Service
   - Подключите ваш GitHub репозиторий
3. **Включите GitHub Pages:**
   - Settings → Pages → Source: GitHub Actions

## Результат:

- **Фронтенд:** `https://ВАШ_USERNAME.github.io/REPO_NAME`
- **Бэкенд:** `https://REPO_NAME-backend.onrender.com`

## Дополнительные параметры:

```powershell
# Если у вас уже есть URL бэкенда на Render
.\deploy.ps1 -GitHubUsername "maksim123" -RepoName "water-meter-app" -RenderBackendUrl "https://my-backend.onrender.com/api"
```