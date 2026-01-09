# Инструкция по загрузке проекта в GitHub

## Шаг 1: Установка Git (если не установлен)

Скачайте и установите Git с официального сайта: https://git-scm.com/download/win

## Шаг 2: Создание репозитория на GitHub

1. Перейдите на https://github.com/new
2. Назовите репозиторий: `water-meter-app`
3. Выберите "Public" или "Private"
4. НЕ добавляйте README, .gitignore или лицензию
5. Нажмите "Create repository"

## Шаг 3: Загрузка проекта

Откройте командную строку в этой папке и выполните:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/water-meter-app.git
git push -u origin main
```

Замените `ВАШ_ЛОГИН` на ваш логин GitHub.

## Шаг 4: Развертывание

После загрузки в GitHub следуйте инструкциям в файле `DEPLOYMENT_GUIDE.md`

## Структура проекта

- `backend/` - серверная часть (Node.js + Express)
- `frontend/` - клиентская часть (React + TypeScript)
- `package.json` - корневой файл с зависимостями
- `vercel.json` - конфигурация для Vercel

## Готовые команды для копирования

После установки Git и создания репозитория на GitHub:

```bash
cd "c:\Users\Макс\Desktop\Ладога Строй\Счетчик воды\Вариант 2\web-deploy"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/water-meter-app.git
git push -u origin main
```

## Альтернативный способ

Если Git не работает, можете:

1. Создать репозиторий на GitHub
2. Нажать "uploading an existing file"
3. Перетащить все файлы из папки web-deploy
4. Нажать "Commit changes"