# Интеграция фронтенда и бэкенда

## Статус интеграции: ✅ ЗАВЕРШЕНА

Приложение успешно интегрировано с REST API бэкенда на Express.js и SQLite.

## Архитектура

### Фронтенд (React + TypeScript)
- **Порт**: 3000
- **API клиент**: `src/services/apiClient.ts`
- **Аутентификация**: JWT токены (сохраняются в localStorage)
- **Базовый URL API**: `http://localhost:5000/api`

### Бэкенд (Express.js)
- **Порт**: 5000
- **БД**: SQLite3 (файл: `water_meter.db`)
- **Аутентификация**: JWT + bcryptjs для хэширования паролей
- **Маршруты API**: 7 модулей с полной поддержкой CRUD операций

## Запуск приложения

### Терминал 1: Бэкенд
```bash
cd backend
npm install
npm start
```
Бэкенд запустится на `http://localhost:5000`

### Терминал 2: Фронтенд
```bash
npm install
npm run dev
```
Фронтенд запустится на `http://localhost:3000`

## Реализованные функции интеграции

### 1. Аутентификация
- **Вход пользователя**: `POST /api/auth/login`
  - Принимает: `accountNumber` (лицевой счет), `password`
  - Возвращает: JWT токен и данные пользователя
  - Дефолт админ: `ADMIN / admin123`

- **Проверка токена**: `GET /api/auth/verify`
  - Восстанавливает сессию при перезагрузке страницы
  - Очищает токен если сессия истекла

### 2. Управление пользователями
- **Получить всех пользователей**: `GET /api/users`
- **Получить пользователя**: `GET /api/users/:id`
- **Создать пользователя**: `POST /api/users` (администратор)
- **Обновить пользователя**: `PUT /api/users/:id` (включая `hasDualMeters`)
- **Удалить пользователя**: `DELETE /api/users/:id` (администратор)

### 3. Показания счетчиков
- **Получить все показания**: `GET /api/readings`
- **Получить показания пользователя**: `GET /api/readings/user/:userId`
- **Добавить показание**: `POST /api/readings`
  - Поддержка одинарных и двойных счетчиков
  - Параметры: `userId`, `coldWater`, `hotWater`, `coldWater2`, `hotWater2`
- **Обновить показание**: `PUT /api/readings/:id`
- **Удалить показание**: `DELETE /api/readings/:id`

### 4. Заявки на услуги
- **Получить все заявки**: `GET /api/applications`
- **Получить заявки пользователя**: `GET /api/applications/user/:userId`
- **Создать заявку**: `POST /api/applications`
- **Обновить заявку**: `PUT /api/applications/:id` (изменение статуса и назначение сантехника)
- **Удалить заявку**: `DELETE /api/applications/:id`

### 5. Новости
- **Получить все новости**: `GET /api/news`
- **Получить новости по поселению**: `GET /api/news/settlement/:settlement`
- **Создать новость**: `POST /api/news` (администратор)
- **Обновить новость**: `PUT /api/news/:id` (администратор)
- **Удалить новость**: `DELETE /api/news/:id` (администратор)

### 6. Обратная связь
- **Получить все отзывы**: `GET /api/feedback` (администратор)
- **Получить отзывы пользователя**: `GET /api/feedback/user/:userId`
- **Создать отзыв**: `POST /api/feedback`
- **Обновить отзыв**: `PUT /api/feedback/:id` (администратор добавляет ответ)
- **Удалить отзыв**: `DELETE /api/feedback/:id` (администратор)

### 7. Управление сантехниками
- **Получить всех сантехников**: `GET /api/plumbers`
- **Создать сантехника**: `POST /api/plumbers` (администратор)
- **Обновить сантехника**: `PUT /api/plumbers/:id` (администратор)
- **Удалить сантехника**: `DELETE /api/plumbers/:id` (администратор)

## Обновленные компоненты фронтенда

### App.tsx
- ✅ Импорт `apiClient`
- ✅ Обновлена функция `handleLogin` для использования API
- ✅ Обновлена функция `handleAdminAuth` для использования API
- ✅ Добавлена функция `handleLogout` с очисткой токена
- ✅ Добавлен `useEffect` для восстановления сессии при загрузке

### Dashboard.tsx
- ✅ Импорт `apiClient`
- ✅ Обновлена функция `handleSubmitReading` для отправки на API
- ✅ Обновлена функция `handleAppSubmit` для отправки заявок на API

### AdminPanel.tsx
- ✅ Импорт `apiClient`
- ✅ Обновлена функция `handleSaveUser` для создания/обновления пользователей через API
- ✅ Обновлена функция `handleAddReadingAdmin` для добавления показаний через API

## Структура БД

### Таблица users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  accountNumber TEXT UNIQUE NOT NULL,
  fullName TEXT NOT NULL,
  address TEXT NOT NULL,
  settlement TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  password TEXT (bcryptjs хэш),
  hasDualMeters BOOLEAN,
  isAdmin BOOLEAN,
  avatarUrl TEXT,
  themeColor TEXT,
  weatherProvider TEXT,
  createdAt TEXT,
  updatedAt TEXT
)
```

### Таблица readings
```sql
CREATE TABLE readings (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  coldWater REAL NOT NULL,
  hotWater REAL NOT NULL,
  coldWater2 REAL,
  hotWater2 REAL,
  submissionDate TEXT NOT NULL,
  createdAt TEXT,
  FOREIGN KEY (userId) REFERENCES users(id)
)
```

### Таблицы applications, news, feedbacks, plumbers
Подробное описание см. в `backend/database.js`

## Переменные окружения

### Фронтенд (.env)
```
VITE_API_KEY=AIzaSyByIiReJxgKGGcOs_2v_i9a5fbF40X_JGc
VITE_API_URL=http://localhost:5000/api
```

### Бэкенд (.env - опционально)
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

## Тестирование API

### Вход администратора
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"ADMIN","password":"admin123"}'
```

### Получение всех пользователей (требует токен)
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Добавление показания
```bash
curl -X POST http://localhost:5000/api/readings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId":"user_id",
    "coldWater":123.45,
    "hotWater":67.89,
    "coldWater2":100.0,
    "hotWater2":50.0
  }'
```

## Миграция данных (опционально)

Если нужно перенести существующие данные из localStorage в БД:

1. Экспортировать данные из localStorage приложения
2. Использовать админ панель для импорта CSV
3. Данные будут сохранены в SQLite БД

## Безопасность

- ✅ Пароли хэшируются с bcryptjs (10 раундов)
- ✅ JWT токены для аутентификации всех запросов
- ✅ CORS включен для localhost:3000
- ✅ Параметризованные запросы для защиты от SQL injection
- ⚠️ Измените JWT_SECRET в production среде

## Проблемы и решения

### Проблема: "Failed to resolve import"
**Решение**: Убедитесь что файл `services/apiClient.ts` существует и правильно расположен.

### Проблема: CORS ошибки
**Решение**: CORS уже настроен в Express. Если проблема сохраняется, проверьте PORT в backend/server.js.

### Проблема: БД не инициализируется
**Решение**: Удалите `water_meter.db` и перезапустите бэкенд. Таблицы создадутся автоматически.

## Следующие шаги

1. ✅ Интеграция аутентификации
2. ✅ Синхронизация показаний между фронтенд и БД
3. ⏳ Кэширование данных на фронтенде для улучшения UX
4. ⏳ Оффлайн режим с последующей синхронизацией
5. ⏳ WebSocket для real-time обновлений заявок
6. ⏳ Развертывание на production сервер

## Контакты для вопросов

- Питкяранта, МКУ ПМО "Хозяйственное управление"
- Email: pitkaranta_hoz@mail.ru
- Телефон: +7 921 466-82-39
