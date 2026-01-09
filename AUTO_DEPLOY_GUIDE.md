# 🚀 Автоматический деплой на Vercel + Railway

## Быстрый старт

### 1. Локальный деплой (одним кликом)

**Windows PowerShell:**
```powershell
.\auto-deploy-vercel-railway.ps1
```

**Windows CMD:**
```cmd
auto-deploy-vercel-railway.bat
```

### 2. Автоматический деплой через GitHub Actions

#### Настройка секретов в GitHub:

1. Перейдите в Settings → Secrets and variables → Actions
2. Добавьте следующие секреты:

**Railway секреты:**
- `RAILWAY_TOKEN` - токен Railway (получить на railway.app/account/tokens)
- `RAILWAY_SERVICE_ID` - ID сервиса Railway
- `RAILWAY_API_URL` - URL вашего Railway приложения

**Vercel секреты:**
- `VERCEL_TOKEN` - токен Vercel (получить на vercel.com/account/tokens)
- `VERCEL_ORG_ID` - ID организации Vercel
- `VERCEL_PROJECT_ID` - ID проекта Vercel

#### Получение токенов:

**Railway:**
1. Зайдите на https://railway.app/account/tokens
2. Создайте новый токен
3. Скопируйте токен в `RAILWAY_TOKEN`

**Vercel:**
1. Зайдите на https://vercel.com/account/tokens
2. Создайте новый токен
3. Скопируйте токен в `VERCEL_TOKEN`

## Структура деплоя

```
Frontend (Vercel)  ←→  Backend (Railway)
     ↓                      ↓
  Static SPA           Node.js API
   (React)             (Express)
```

## Переменные окружения

### Frontend (.env.local):
```env
VITE_API_URL=https://your-railway-app.railway.app
VITE_GEMINI_API_KEY=your_gemini_key
```

### Backend (Railway Environment Variables):
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

## Мониторинг

- **Frontend**: https://vercel.com/dashboard
- **Backend**: https://railway.app/dashboard

## Troubleshooting

### Проблема: Railway не может найти package.json
**Решение:** Убедитесь, что в railway.json указан правильный путь к backend

### Проблема: CORS ошибки
**Решение:** Проверьте переменную CORS_ORIGIN в Railway

### Проблема: Vercel не может собрать проект
**Решение:** Проверьте переменную VITE_API_URL

## Команды для отладки

```bash
# Проверить статус Railway
railway status

# Проверить логи Railway
railway logs

# Проверить статус Vercel
vercel ls

# Локальная разработка
npm run dev  # Frontend
cd backend && npm run dev  # Backend
```