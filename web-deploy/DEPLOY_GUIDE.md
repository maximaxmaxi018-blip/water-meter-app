# 🚀 Развертывание на Vercel + Railway

## Шаг 1: Подготовка

### Установите CLI инструменты
```bash
npm install -g vercel @railway/cli
```

### Создайте аккаунты
- [Vercel](https://vercel.com/signup)
- [Railway](https://railway.app)

---

## Шаг 2: Развертывание Backend на Railway

### 2.1 Логин в Railway
```bash
railway login
```

### 2.2 Инициализация проекта
```bash
cd backend
railway init
```

### 2.3 Деплой
```bash
railway up
```

### 2.4 Получение URL
```bash
railway domain
```
Сохраните этот URL, он понадобится для frontend.

---

## Шаг 3: Развертывание Frontend на Vercel

### 3.1 Логин в Vercel
```bash
vercel login
```

### 3.2 Установка переменной окружения
```bash
# Замените YOUR_BACKEND_URL на URL из шага 2.4
vercel env add VITE_API_URL
# Введите: YOUR_BACKEND_URL
```

### 3.3 Деплой
```bash
vercel --prod
```

---

## Автоматический деплой (Windows)

Запустите PowerShell скрипт:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\deploy.ps1
```

---

## Проверка

1. Откройте URL Vercel в браузере
2. Проверьте подключение к backend
3. Попробуйте войти с учетными данными:
   - Счет: `ADMIN`
   - Пароль: `admin123`

---

## Переменные окружения

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend.railway.app
VITE_API_KEY=AIzaSyByIiReJxgKGGcOs_2v_i9a5fbF40X_JGc
```

### Backend (backend/.env)
```
PORT=3001
JWT_SECRET=water-meter-secret-key-2026
NODE_ENV=production
DATABASE_URL=./water_meter.db
```

---

## Мониторинг

### Railway Dashboard
https://railway.app/dashboard

### Vercel Dashboard
https://vercel.com/dashboard

---

## Решение проблем

### Backend не доступен
```bash
cd backend
railway logs
```

### Frontend не подключается к backend
- Проверьте VITE_API_URL в Vercel Environment Variables
- Убедитесь, что backend запущен на Railway

### Ошибка при деплое
```bash
# Очистить кэш
rm -rf .vercel
rm -rf node_modules
npm install
```
