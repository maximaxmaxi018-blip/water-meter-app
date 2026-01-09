#!/bin/bash

set -e

echo "=========================================="
echo "  Развертывание на Vercel + Railway"
echo "=========================================="
echo ""

# Проверка инструментов
echo "[1/5] Проверка инструментов..."
command -v vercel >/dev/null 2>&1 || { npm install -g vercel; }
command -v railway >/dev/null 2>&1 || { npm install -g @railway/cli; }
echo "✅ Инструменты готовы"

# Установка зависимостей
echo ""
echo "[2/5] Установка зависимостей..."
npm ci
cd backend && npm ci && cd ..
echo "✅ Зависимости установлены"

# Деплой backend
echo ""
echo "[3/5] Развертывание backend на Railway..."
cd backend
railway login
railway link || railway init
railway up
BACKEND_URL=$(railway domain 2>/dev/null || echo "https://your-backend.railway.app")
cd ..
echo "✅ Backend: $BACKEND_URL"

# Сборка frontend
echo ""
echo "[4/5] Сборка frontend..."
VITE_API_URL=$BACKEND_URL npm run build
echo "✅ Frontend собран"

# Деплой frontend
echo ""
echo "[5/5] Развертывание frontend на Vercel..."
vercel login
vercel --prod --env VITE_API_URL=$BACKEND_URL
echo "✅ Frontend развернут"

echo ""
echo "=========================================="
echo "✅ Развертывание завершено!"
echo "Backend: $BACKEND_URL"
echo "=========================================="
