# Счетчик воды - Веб-приложение

## Быстрый старт

### Локальная разработка
```bash
npm install
npm run dev
```

### Сборка для продакшена
```bash
npm run build
```

### Локальное тестирование сборки
```bash
# Запустите serve-local.bat или:
npx serve dist -p 3000
```

## Развертывание

### 1. GitHub Pages (фронтенд)
1. Создайте репозиторий на GitHub
2. Замените `water-meter-app` в `vite.config.ts` на имя вашего репозитория
3. Загрузите код в репозиторий
4. Включите GitHub Pages в настройках репозитория

### 2. Render.com (бэкенд)
1. Создайте Web Service на Render.com
2. Подключите ваш GitHub репозиторий
3. Настройте переменные окружения

## Структура проекта
- `src/` - исходный код React приложения
- `dist/` - собранное приложение для продакшена
- `server/` - Node.js бэкенд (если есть)

## Технологии
- React + TypeScript
- Vite
- Tailwind CSS
- Recharts
- DOMPurify