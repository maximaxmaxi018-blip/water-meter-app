# Решение проблемы с развертыванием

## Проблема
Railway показывает ошибку: "Your account is on a limited plan"

## Решения

### Вариант 1: Обновить план Railway (Рекомендуется)
1. Перейдите на https://railway.com/account/plans
2. Выберите подходящий платный план (от $5/месяц)
3. После обновления плана запустите: `auto-deploy-vercel-railway.bat`

### Вариант 2: Использовать бесплатные альтернативы

#### Frontend: Vercel (бесплатно)
```bash
# Запустите этот скрипт:
deploy-frontend-only.bat
```

#### Backend: Render.com (бесплатно)
1. Создайте аккаунт на https://render.com
2. Подключите ваш GitHub репозиторий
3. Создайте новый Web Service со следующими настройками:
   - **Name**: water-meter-backend
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

4. Добавьте переменные окружения:
   - `NODE_ENV=production`
   - `JWT_SECRET=your_secret_key_here`
   - `CORS_ORIGIN=https://your-vercel-domain.vercel.app`

### Вариант 3: Локальное развертывание
```bash
# Frontend
npm run dev

# Backend (в отдельном терминале)
cd backend
npm run dev
```

### Вариант 4: Docker (для продвинутых пользователей)
```bash
# Создайте Docker контейнеры
docker-compose up -d
```

## Быстрый старт

1. **Только frontend**: Запустите `deploy-frontend-only.bat`
2. **Полное развертывание**: Запустите `deploy-alternative.bat`
3. **Локальная разработка**: Запустите `start-local.bat`

## Проверка развертывания

После развертывания проверьте:
- [ ] Frontend доступен по URL
- [ ] Backend отвечает на `/health`
- [ ] Авторизация работает
- [ ] База данных подключена

## Поддержка

Если возникли проблемы:
1. Проверьте логи в консоли браузера
2. Убедитесь, что все переменные окружения настроены
3. Проверьте CORS настройки
4. Обратитесь к документации платформы развертывания