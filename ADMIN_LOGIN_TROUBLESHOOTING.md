# Решение проблемы входа в админ-панель

## Проблема
После ввода логина и пароля администратора приложение не загружает админ-панель.

## Причины
1. Флаг `isAdmin` в базе данных не установлен в `1` для пользователя ADMIN
2. Флаг `isAdmin` возвращается как `0` вместо `true` при входе
3. Условие отображения админ-панели не проверяет флаг `isAdmin`

## Решение

### Шаг 1: Проверьте базу данных
Запустите скрипт проверки:
```bash
cd backend
node verify-admin.js
```

Вы должны увидеть:
```
Admin user found:
  - ID: admin
  - Account Number: ADMIN
  - Full Name: Администратор Системы
  - isAdmin: 1 (type: number)
  - Password set: true

SUCCESS: Admin user is properly configured
```

### Шаг 2: Перезагрузите сервер
Если админ не найден или `isAdmin` не равен 1, перезагрузите backend сервер:

```bash
# Остановите текущий процесс (Ctrl+C)
# Затем запустите заново:
npm start
```

При запуске сервер автоматически создаст/обновит администратора в базе данных.

### Шаг 3: Очистите кэш браузера
1. Откройте DevTools (F12)
2. Перейдите на вкладку Application/Storage
3. Очистите localStorage и sessionStorage
4. Перезагрузите страницу (Ctrl+R или Cmd+R)

### Шаг 4: Попробуйте вход заново
1. Нажмите кнопку "Вход для сотрудников" в нижней части страницы
2. В модальном окне:
   - **Логин доступа**: оставьте пустым (или введите `admin`)
   - **Пароль**: `admin123`
3. Нажмите "Подтвердить вход"

## Отладка

### Проверьте консоль браузера (F12 > Console)
Вы должны увидеть логи:
```
Admin auth attempt with accountNumber: ADMIN
Admin login response: {...}
Response user isAdmin: 1 type: number
isAdmin after conversion: true
Setting currentUser with isAdmin: true
Admin authentication successful
✓ AdminPanel rendering with user: ADMIN isAdmin: true
```

### Проверьте консоль сервера
Вы должны увидеть:
```
✓ Password valid for user: ADMIN isAdmin: 1 type: number
✓ isAdmin converted to boolean: true
✓ Returning login response with isAdmin: true type: boolean
```

## Если проблема сохраняется

### Вариант 1: Удалите базу данных
```bash
cd backend
rm water_meter.db
npm start
```

Сервер создаст новую базу данных с правильно настроенным администратором.

### Вариант 2: Проверьте версию Node.js
```bash
node --version
```

Требуется Node.js 16 или выше.

### Вариант 3: Проверьте переменные окружения
Убедитесь, что в файле `.env` установлены правильные значения:
```
JWT_SECRET=your-secret-key-change-in-production
```

## Учетные данные администратора
- **Логин**: ADMIN (или оставить пусто)
- **Пароль**: admin123

## Что должно произойти после успешного входа
1. Модальное окно входа закроется
2. Вы будете перенаправлены на админ-панель
3. Вы увидите реестр абонентов с кнопками управления
4. В верхней части страницы будет зеленое сообщение "✅ Админ-панель успешно загружена!"
