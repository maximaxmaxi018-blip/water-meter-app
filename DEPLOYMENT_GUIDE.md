# Развертывание проекта на GitHub Pages + Render

## ✅ ОШИБКА СБОРКИ ИСПРАВЛЕНА!

Проблема `Could not resolve "./pages/LandingPage"` была решена. Все файлы скопированы в правильную структуру `src/`.

## Шаг 1: Установка Git (если не установлен)

**ВАЖНО:** Для работы с GitHub необходимо установить Git.

1. Скачайте Git с https://git-scm.com/download/win
2. Установите с настройками по умолчанию
3. Перезапустите командную строку

## Шаг 2: Подготовка GitHub репозитория

1. Создайте новый репозиторий на GitHub: https://github.com/new
2. Назовите его (например: `water-meter-app`)
3. Инициализируйте Git локально:

```powershell
Set-Location "c:\Users\Макс\Desktop\Ладога Строй\Счетчик воды\Вариант 2"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/water-meter-app.git
git push -u origin main
```

## Шаг 2: Развертывание бэкенда на Render

1. Перейдите на https://render.com
2. Нажмите "New" → "Web Service"
3. Подключите ваш GitHub репозиторий
4. Выберите ваш репозиторий `water-meter-app`
5. Настройте параметры:
   - **Name**: `water-meter-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Добавьте переменные окружения:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (сгенерируйте случайную строку)
7. Нажмите "Create Web Service"
8. Скопируйте URL вашего бэкенда (например: `https://water-meter-backend.onrender.com`)

## Шаг 3: Развертывание фронтенда на GitHub Pages

1. В вашем репозитории перейдите в Settings → Pages
2. В разделе "Source" выберите "GitHub Actions"
3. Создайте файл `.github/workflows/deploy.yml` в корне проекта:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_API_URL: https://water-meter-backend.onrender.com/api
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

4. Сделайте commit и push:
```powershell
git add .
git commit -m "Add GitHub Pages deployment"
git push
```

5. Ваш сайт будет доступен по адресу: `https://YOUR_USERNAME.github.io/water-meter-app`

## Шаг 4: Настройка базового пути для GitHub Pages

Обновите `vite.config.ts` для корректной работы на GitHub Pages:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/water-meter-app/', // Замените на имя вашего репозитория
  build: {
    outDir: 'dist'
  }
})
```

## Шаг 5: Тестирование

1. Откройте URL вашего фронтенда: `https://YOUR_USERNAME.github.io/water-meter-app`
2. Проверьте, что приложение загружается
3. Попробуйте войти с тестовыми учетными данными
4. Проверьте, что данные загружаются с бэкенда

## Автоматическое развертывание

После этого каждый раз, когда вы делаете `git push` в ветку `main`:
- Render автоматически перестроит и развернет бэкенд
- GitHub Actions автоматически перестроит и развернет фронтенд на GitHub Pages

## Ссылка для тестирования

Поделитесь этой ссылкой с людьми для тестирования:
```
https://YOUR_USERNAME.github.io/water-meter-app
```

## Мониторинг

- Render: https://dashboard.render.com
- GitHub Actions: https://github.com/YOUR_USERNAME/water-meter-app/actions
