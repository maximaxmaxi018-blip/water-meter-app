# Развертывание приложения

## Локальная разработка

### Предварительные требования
- Node.js v18 или выше
- npm или yarn
- Git

### Установка и запуск

#### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd "Счетчик воды"
```

#### 2. Установка зависимостей фронтенда
```bash
npm install
```

#### 3. Установка зависимостей бэкенда
```bash
cd backend
npm install
cd ..
```

#### 4. Создание файла .env для фронтенда (если не существует)
```bash
cat > .env << EOF
VITE_API_KEY=AIzaSyByIiReJxgKGGcOs_2v_i9a5fbF40X_JGc
VITE_API_URL=http://localhost:5000/api
EOF
```

#### 5. Запуск бэкенда (Терминал 1)
```bash
cd backend
npm start
```
Должно вывести:
```
Backend server running on http://localhost:5000
API available at http://localhost:5000/api
Connected to SQLite database
Database tables initialized successfully
```

#### 6. Запуск фронтенда (Терминал 2)
```bash
npm run dev
```
Должно вывести:
```
Local:   http://localhost:3000/
```

#### 7. Открыть браузер
Перейти на `http://localhost:3000`

## Production развертывание

### На Linux/Ubuntu сервере

#### 1. Подготовка сервера
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установка PM2 для управления процессами
sudo npm install -g pm2

# Установка Nginx
sudo apt install -y nginx
```

#### 2. Развертывание приложения
```bash
# Клонирование репозитория
cd /var/www
sudo git clone <repository-url> water-meter-app
cd water-meter-app

# Установка зависимостей
npm install --production
cd backend && npm install --production && cd ..

# Сборка фронтенда
npm run build
```

#### 3. Конфигурация переменных окружения

Создать `.env` файл в корне проекта:
```bash
cat > .env << 'EOF'
VITE_API_KEY=AIzaSyByIiReJxgKGGcOs_2v_i9a5fbF40X_JGc
VITE_API_URL=https://your-domain.com/api
NODE_ENV=production
EOF
```

Создать `backend/.env` файл:
```bash
cat > backend/.env << 'EOF'
PORT=5000
JWT_SECRET=your-very-secure-secret-key-here-change-it
NODE_ENV=production
DATABASE_PATH=/var/www/water-meter-app/backend/water_meter.db
EOF
```

#### 4. Настройка PM2

Создать `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'water-meter-backend',
      script: './backend/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log'
    },
    {
      name: 'water-meter-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/var/www/water-meter-app',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log'
    }
  ]
};
```

Запустить приложение с PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. Настройка Nginx

Создать конфигурацию `/etc/nginx/sites-available/water-meter`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Редирект на HTTPS (если используется SSL)
    # return 301 https://$server_name$request_uri;

    # Фронтенд
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Бэкенд API
    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Статические файлы
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Активировать конфигурацию:
```bash
sudo ln -s /etc/nginx/sites-available/water-meter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. SSL сертификат (Let's Encrypt)
```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификата
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Обновление Nginx конфигурации для HTTPS
sudo certbot install --nginx
```

#### 7. Автоматическое резервное копирование БД
```bash
# Создать скрипт резервного копирования
mkdir -p /var/www/water-meter-app/backups

cat > /var/www/water-meter-app/backups/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/www/water-meter-app/backups"
DB_FILE="/var/www/water-meter-app/backend/water_meter.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

cp $DB_FILE $BACKUP_DIR/water_meter_$TIMESTAMP.db

# Сохранять только последние 30 дней
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
EOF

chmod +x /var/www/water-meter-app/backups/backup.sh
```

Добавить в crontab (ежедневное резервное копирование в 02:00):
```bash
sudo crontab -e
# Добавить строку:
0 2 * * * /var/www/water-meter-app/backups/backup.sh
```

## Мониторинг и логирование

### Просмотр логов PM2
```bash
pm2 logs water-meter-backend
pm2 logs water-meter-frontend
```

### Мониторинг в реальном времени
```bash
pm2 monit
```

### Проверка статуса
```bash
pm2 status
```

## Обновление приложения

```bash
cd /var/www/water-meter-app

# Получить последние изменения
git pull origin main

# Обновить зависимости если нужно
npm install --production
cd backend && npm install --production && cd ..

# Пересобрать фронтенд
npm run build

# Перезапустить приложение
pm2 restart all
```

## Диагностика проблем

### Проблема: Порт занят
```bash
# Найти процесс, использующий порт 5000
sudo lsof -i :5000

# Завершить процесс
sudo kill -9 <PID>
```

### Проблема: БД заблокирована
```bash
# Удалить файл БД (она пересоздастся с default admin)
rm /var/www/water-meter-app/backend/water_meter.db
pm2 restart water-meter-backend
```

### Проблема: Недостаточно памяти
```bash
# Увеличить лимит памяти Node.js
pm2 start backend/server.js --max-memory-restart 500M
```

### Проверка соединения с БД
```bash
cd /var/www/water-meter-app/backend
node << 'EOF'
import('./database.js').then(() => {
  console.log('Database connection successful');
  process.exit(0);
});
EOF
```

## Безопасность для Production

1. **Измените JWT_SECRET** на надежный ключ
2. **Используйте HTTPS** с SSL сертификатом
3. **Настройте файрвол** для разрешения только необходимых портов
4. **Регулярно обновляйте** зависимости (`npm audit fix`)
5. **Создавайте резервные копии** БД
6. **Логируйте ошибки** на отдельный сервер
7. **Используйте rate limiting** для API
8. **Включите CORS** только для доверенных доменов

## Переход на Docker (опционально)

### Dockerfile для фронтенда
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Dockerfile для бэкенда
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend ./
RUN npm ci --only=production
EXPOSE 5000
CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:5000/api
  
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - JWT_SECRET=your-secret-key
      - NODE_ENV=production
    volumes:
      - ./backend/water_meter.db:/app/water_meter.db
```

Запуск с Docker:
```bash
docker-compose up -d
```

## Контакты поддержки

- Техническая поддержка: support@example.com
- Документация: https://your-domain.com/docs
- Bug отчеты: GitHub Issues
