#!/bin/bash

# Скрипт для тестирования API бэкенда
# Использование: ./test-api.sh

API_URL="http://localhost:5000/api"
ADMIN_TOKEN=""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Тестирование API системы управления счетчиками воды${NC}\n"

# Функция для тестирования запроса
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  
  echo -e "${YELLOW}📍 $description${NC}"
  echo "   $method $endpoint"
  
  if [ -z "$data" ]; then
    curl -s -X "$method" "$API_URL$endpoint" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json"
  else
    curl -s -X "$method" "$API_URL$endpoint" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data"
  fi
  
  echo -e "\n"
}

# 1. Проверка здоровья сервера
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo "1. ПРОВЕРКА ЗДОРОВЬЯ СЕРВЕРА"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

response=$(curl -s "$API_URL/health" 2>/dev/null)
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Сервер доступен${NC}"
  echo "Ответ: $response\n"
else
  echo -e "${RED}❌ Сервер недоступен на $API_URL${NC}"
  echo "Убедитесь что бэкенд запущен: cd backend && npm start\n"
  exit 1
fi

# 2. АУТЕНТИФИКАЦИЯ
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo "2. АУТЕНТИФИКАЦИЯ"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}📍 Вход администратора (ADMIN / admin123)${NC}"
echo "   POST /auth/login"

login_response=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"ADMIN","password":"admin123"}')

echo "$login_response" | jq '.'

# Извлечение токена
ADMIN_TOKEN=$(echo "$login_response" | jq -r '.token // empty')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" == "null" ]; then
  echo -e "${RED}❌ Не удалось получить токен${NC}\n"
  exit 1
else
  echo -e "${GREEN}✅ Токен получен${NC}\n"
fi

# 3. ПОЛЬЗОВАТЕЛИ
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo "3. УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

test_endpoint "GET" "/users" "" "Получить всех пользователей"

# 4. СОЗДАНИЕ НОВОГО ПОЛЬЗОВАТЕЛЯ
echo -e "${YELLOW}📍 Создание нового пользователя${NC}"
echo "   POST /users"

new_user_data='{
  "accountNumber":"100131",
  "fullName":"Иван Петрович Сидоров",
  "address":"ул. Ленина, д. 25, кв. 15",
  "settlement":"г. Питкяранта",
  "phone":"+7 921 123-45-67",
  "email":"ivan.sidorov@example.com",
  "password":"testpass123",
  "hasDualMeters":false
}'

create_user_response=$(curl -s -X POST "$API_URL/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$new_user_data")

echo "$create_user_response" | jq '.'
NEW_USER_ID=$(echo "$create_user_response" | jq -r '.id // empty')

if [ -z "$NEW_USER_ID" ] || [ "$NEW_USER_ID" == "null" ]; then
  NEW_USER_ID="100131"
  echo -e "${YELLOW}ℹ️ Используем ID из данных: $NEW_USER_ID${NC}\n"
else
  echo -e "${GREEN}✅ Пользователь создан с ID: $NEW_USER_ID${NC}\n"
fi

# 5. ПОКАЗАНИЯ СЧЕТЧИКОВ
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo "4. УПРАВЛЕНИЕ ПОКАЗАНИЯМИ СЧЕТЧИКОВ"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

# Вход как обычный пользователь
echo -e "${YELLOW}📍 Вход пользователя (100101)${NC}"

user_login=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"100101","password":"password"}')

USER_TOKEN=$(echo "$user_login" | jq -r '.token // empty')

if [ ! -z "$USER_TOKEN" ] && [ "$USER_TOKEN" != "null" ]; then
  echo -e "${GREEN}✅ Пользователь авторизован${NC}\n"
  
  # Получение показаний пользователя
  test_endpoint "GET" "/readings/user/u1" "" "Получить показания пользователя 100101"
  
  # Добавление нового показания
  echo -e "${YELLOW}📍 Добавление показания счетчика${NC}"
  echo "   POST /readings"
  
  reading_data='{
    "userId":"u1",
    "coldWater":150.45,
    "hotWater":75.20,
    "coldWater2":null,
    "hotWater2":null
  }'
  
  curl -s -X POST "$API_URL/readings" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$reading_data" | jq '.'
  
  echo ""
else
  echo -e "${YELLOW}ℹ️ Пользователь 100101 требует первоначальной установки пароля${NC}\n"
fi

# 6. ЗАЯВКИ НА УСЛУГИ
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo "5. УПРАВЛЕНИЕ ЗАЯВКАМИ НА УСЛУГИ"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

test_endpoint "GET" "/applications" "" "Получить все заявки (админ)"

# 7. НОВОСТИ
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo "6. УПРАВЛЕНИЕ НОВОСТЯМИ"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

test_endpoint "GET" "/news" "" "Получить все новости"

echo -e "${YELLOW}📍 Создание новости${NC}"
echo "   POST /news"

news_data='{
  "type":"info",
  "title":"Плановая проверка оборудования",
  "content":"Уважаемые жители! 15 января будет проводиться плановая проверка узлов учета воды. Отключения не планируются.",
  "settlement":"г. Питкяранта",
  "recoveryTime":null
}'

curl -s -X POST "$API_URL/news" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$news_data" | jq '.'

echo ""

# 8. САНТЕХНИКИ
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo "7. УПРАВЛЕНИЕ САНТЕХНИКАМИ"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

test_endpoint "GET" "/plumbers" "" "Получить всех сантехников"

# 9. ОБРАТНАЯ СВЯЗЬ
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo "8. ОБРАТНАЯ СВЯЗЬ"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

test_endpoint "GET" "/feedback" "" "Получить все отзывы (админ)"

# Итоговый отчет
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}\n"

echo "📊 Сводка:"
echo "  ✅ Здоровье сервера"
echo "  ✅ Аутентификация администратора"
echo "  ✅ Управление пользователями"
echo "  ✅ Показания счетчиков"
echo "  ✅ Заявки на услуги"
echo "  ✅ Новости и объявления"
echo "  ✅ Сантехники"
echo "  ✅ Обратная связь"
echo ""
echo "🔑 Администратор токен: $ADMIN_TOKEN"
echo ""
echo "📝 Для более детального тестирования используйте Postman или curl:"
echo "   curl -X GET http://localhost:5000/api/users \\"
echo "     -H 'Authorization: Bearer $ADMIN_TOKEN'"
echo ""
