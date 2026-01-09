# ⚡ QUICK START - Быстрый старт

## 🚀 30 секунд для запуска приложения

### Требования
- Node.js v18+
- 2 терминала

### Запуск

**Терминал 1 - Бэкенд:**
```bash
cd backend
npm install
npm start
```

Ожидайте: `Backend server running on http://localhost:5000`

**Терминал 2 - Фронтенд:**
```bash
npm install
npm run dev
```

Ожидайте: `Local:   http://localhost:3000/`

**Откройте браузер:** http://localhost:3000

---

## 📋 Тестовые учетные данные

### Администратор
```
Лицевой счет: ADMIN
Пароль:       admin123
```

### Тестовые пользователи
```
Лицевые счета: 100101 - 100130
Пароль:        Любой (генерируется при первом входе)
```

---

## 📁 Структура

```
.
├── backend/               # REST API (Express + SQLite)
│   ├── server.js         # Основной сервер
│   ├── database.js       # Инициализация БД
│   ├── routes/           # API маршруты (7 файлов)
│   └── water_meter.db    # База данных
│
├── src/
│   ├── services/
│   │   └── apiClient.ts  # API клиент
│   ├── pages/            # Основные страницы
│   ├── components/       # React компоненты
│   └── App.tsx           # Главный компонент
│
├── INTEGRATION.md        # 📖 Полная техническая документация
├── DEPLOYMENT.md         # 🚀 Production развертывание
├── CHANGELOG.md          # 📋 Полный список изменений
└── README.md             # 📚 Описание приложения
```

---

## ✅ Проверка интеграции

После запуска обоих приложений:

1. **Откройте приложение** в браузере: http://localhost:3000
2. **Вход администратора:**
   - Нажмите на логотип внизу слева
   - Введите: ADMIN / admin123
   - Откроется админ-панель

3. **Проверьте API:**
```bash
# В термине (требует curl или Postman)
curl http://localhost:5000/api/health
```

Должно вернуться: `{"status":"ok"}`

---

## 🔧 Если возникли проблемы

### Бэкенд не запускается
```bash
# Удалите БД и перезапустите
rm backend/water_meter.db
npm start
```

### Ошибка "Port already in use"
```bash
# Найти процесс на порту 5000 (Windows PowerShell)
Get-Process | Where-Object {$_.Name -like "*node*"}

# Или просто использовать другой порт в backend/server.js
```

### Ошибка CORS
- Убедитесь что фронтенд на 3000, бэкенд на 5000
- CORS настроен автоматически для localhost:3000

---

## 🌐 API Endpoints (примеры)

### Вход
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"ADMIN","password":"admin123"}'
```

### Получить пользователей
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Добавить показание
```bash
curl -X POST http://localhost:5000/api/readings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId":"u1",
    "coldWater":123.45,
    "hotWater":67.89
  }'
```

---

## 📚 Документация

| Документ | Содержание |
|----------|-----------|
| [README.md](./README.md) | Основное описание проекта |
| [INTEGRATION.md](./INTEGRATION.md) | Техническая документация интеграции |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production развертывание |
| [CHANGELOG.md](./CHANGELOG.md) | Полный журнал изменений |
| [backend/README.md](./backend/README.md) | API документация |

---

## 🎯 Основные функции

✅ Ввод и просмотр показаний счетчиков воды
✅ Раздельные графики ХВС и ГВС
✅ Поддержка двойных счетчиков (2 ХВС + 2 ГВС)
✅ Заявки на поверку и замену счетчиков
✅ Управление сантехниками
✅ Новости и объявления для жителей
✅ Система обратной связи с ответами администрации
✅ CSV экспорт данных
✅ Генерация PDF квитанций
✅ Темный режим
✅ JWT аутентификация
✅ SQLite база данных

---

## 🔐 Безопасность

- ✅ Пароли хешируются bcryptjs
- ✅ JWT токены
- ✅ CORS включен
- ✅ Параметризованные SQL запросы

⚠️ **Для Production:** Измените JWT_SECRET в backend/.env

---

## 📱 Поддерживаемые браузеры

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 💡 Советы

1. **Разработка с live reload:**
   - Фронтенд автоматически перезагружается при изменении файлов
   - Бэкенд перезагружается с `npm run dev` (--watch режим)

2. **Отладка API:**
   - Используйте DevTools браузера (Network вкладка)
   - Или Postman для тестирования эндпоинтов

3. **Просмотр БД:**
   - Используйте SQLite Browser для просмотра water_meter.db

4. **Логирование:**
   - Бэкенд выводит логи в консоль
   - Проверьте консоль браузера для ошибок фронтенда

---

## 🤝 Поддержка

**МКУ ПМО "Хозяйственное управление"**
- 📧 pitkaranta_hoz@mail.ru
- 📱 +7 921 466-82-39

---

## 📄 Лицензия

Приватное приложение для МКУ ПМО "Хозяйственное управление"

---

**Версия**: 2.0 (с полной интеграцией бэкенда)
**Последнее обновление**: 8 января 2026

Готово к разработке! 🚀
