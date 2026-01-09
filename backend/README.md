# Water Meter Management System - Backend

Бэкенд API для системы управления счетчиками воды МКУ ПМО "Хозяйственное управление".

## Установка

1. **Перейдите в папку backend:**
```bash
cd backend
```

2. **Установите зависимости:**
```bash
npm install
```

## Запуск сервера

**Режим разработки (с автоперезагрузкой):**
```bash
npm run dev
```

**Обычный запуск:**
```bash
npm start
```

Сервер запустится на `http://localhost:5000`

## API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/change-password` - Смена пароля
- `GET /api/auth/verify` - Проверка токена

### Пользователи
- `GET /api/users` - Получить всех пользователей (админ)
- `GET /api/users/:id` - Получить пользователя по ID
- `POST /api/users` - Создать нового пользователя (админ)
- `PUT /api/users/:id` - Обновить пользователя
- `DELETE /api/users/:id` - Удалить пользователя (админ)

### Показания
- `GET /api/readings` - Получить все показания (админ)
- `GET /api/readings/user/:userId` - Получить показания пользователя
- `POST /api/readings` - Создать новое показание
- `PUT /api/readings/:id` - Обновить показание
- `DELETE /api/readings/:id` - Удалить показание (админ)

### Заявки
- `GET /api/applications` - Получить все заявки (админ)
- `GET /api/applications/user/:userId` - Получить заявки пользователя
- `POST /api/applications` - Создать новую заявку
- `PUT /api/applications/:id` - Обновить заявку
- `DELETE /api/applications/:id` - Удалить заявку (админ)

### Новости
- `GET /api/news` - Получить все новости
- `GET /api/news/settlement/:settlement` - Получить новости по поселению
- `POST /api/news` - Создать новость (админ)
- `PUT /api/news/:id` - Обновить новость (админ)
- `DELETE /api/news/:id` - Удалить новость (админ)

### Обратная связь
- `GET /api/feedback` - Получить всю обратную связь (админ)
- `GET /api/feedback/user/:userId` - Получить отзывы пользователя
- `POST /api/feedback` - Создать отзыв
- `PUT /api/feedback/:id` - Ответить на отзыв (админ)
- `DELETE /api/feedback/:id` - Удалить отзыв (админ)

### Сантехники
- `GET /api/plumbers` - Получить всех сантехников
- `POST /api/plumbers` - Создать сантехника (админ)
- `PUT /api/plumbers/:id` - Обновить сантехника (админ)
- `DELETE /api/plumbers/:id` - Удалить сантехника (админ)

## База данных

SQLite база данных создается автоматически при запуске сервера в файле `water_meter.db`.

Таблицы:
- `users` - Пользователи и администраторы
- `readings` - Показания счетчиков
- `applications` - Сервисные заявки
- `news` - Новости и оповещения
- `feedbacks` - Отзывы пользователей
- `plumbers` - Сантехники и специалисты

## Администратор по умолчанию

**Логин:** ADMIN
**Пароль:** admin123

⚠️ **ВАЖНО:** Измените пароль администратора при первом входе в production!

## Аутентификация

API использует JWT (JSON Web Tokens) для аутентификации.

При логине вы получите token, который нужно отправлять в заголовке:
```
Authorization: Bearer <token>
```

## Порты

- Frontend (Vite): `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Переменные окружения

При необходимости создайте файл `.env` в папке backend:

```env
PORT=5000
JWT_SECRET=your-secret-key-here
```

## Статус здоровья

Проверить статус сервера:
```bash
curl http://localhost:5000/api/health
```
