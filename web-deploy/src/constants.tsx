
import React from 'react';
import { User } from './types';

export const ORG_INFO = {
  name: 'МКУ ПМО "Хозяйственное управление"',
  location: 'г. Питкяранта',
  email: 'pitkaranta_hoz@mail.ru',
  phone: '+7 921 466-82-39',
  dispatchPhone: '+7 964 317-52-88',
  address: 'Карелия Респ, р-н. Питкярантский, г. Питкяранта, ул. Ленина, д. 13',
  legalAddress: '186810, РЕСПУБЛИКА КАРЕЛИЯ, М.О. ПИТКЯРАНТСКИЙ, Г ПИТКЯРАНТА, УЛ ЛЕНИНА, Д. 13',
  coords: {
    lat: 61.573918,
    lng: 31.477784
  },
  tariffs: {
    cold: 45.20, // руб/м3
    hot: 180.50, // руб/м3
    disposal: 35.40, // руб/м3 (Водоотведение)
    delivery: 550.00, // руб за 1 м3 подвоза
  },
  readingPeriod: 'с 18 по 25 число каждого месяца'
};

export const WEATHER_PROVIDERS = [
  { id: 'open-meteo', name: 'Open-Meteo', desc: 'Бесплатный источник (по умолчанию)', icon: 'fa-cloud-sun' },
  { id: 'openweathermap', name: 'OpenWeatherMap', desc: 'Популярный мировой сервис', icon: 'fa-sun' },
  { id: 'weatherapi', name: 'WeatherAPI', desc: 'Высокая точность данных', icon: 'fa-bolt' },
];

export const WATER_FACTS = [
  "Питкяранта в переводе с финского (Pitkäranta) означает «Длинный берег». Название оправдано протяженностью береговой линии вдоль Ладоги.",
  "Ладожское озеро — крупнейшее пресноводное озеро в Европе. Его объем воды составляет около 908 кубических километров.",
  "В Питкярантском районе находится самый высокий водопад Карелии и Северного Приладожья — Юканкоски (Белые мосты), его высота около 18 метров.",
  "Капля воды проводит в атмосфере в среднем 9 дней, прежде чем выпасть в виде осадков.",
  "Человек на 60-70% состоит из воды. Мозг человека состоит из воды на 85%.",
  "Один капающий кран может привести к потере до 75 литров воды в сутки.",
  "Для производства одного стакана апельсинового сока требуется около 190 литров воды (с учетом полива деревьев).",
  "Струйка воды толщиной в иголку за сутки может «вылить» до 500 литров ресурса.",
  "Вода — единственное вещество на Земле, которое встречается в природе в трех состояниях: жидком, твердом и газообразном.",
  "В Карелии добывается уникальный камень шунгит — единственный в мире природный минерал, обладающий способностью эффективно очищать воду от вредных примесей.",
  "Бережное отношение к воде в Питкяранте помогает сохранить уникальную экосистему Ладожского озера.",
  "Горячая вода замерзает быстрее холодной. Этот феномен называется «эффектом Мпембы».",
  "Если вся вода на Земле поместится в трехлитровую банку, то пресной воды в ней будет всего полстакана, а доступной для питья — всего пара капель.",
  "Вода отражает 5% солнечных лучей, в то время как снег может отражать до 85%.",
  "В Питкяранте вода проходит многоступенчатую систему фильтрации, прежде чем попасть в ваши краны.",
  "За свою жизнь человек выпивает в среднем около 35 тонн воды.",
  "Принятие душа в течение 5 минут расходует около 100 литров воды. Принятие ванны — в два раза больше.",
  "Для смыва в туалеге тратится около 30% всей потребляемой дома воды.",
  "Озеро Ладога питает более 30 городов, включая Санкт-Петербург, но именно в Приладожье вода считается наиболее чистой.",
  "Вода обладает памятью? Ученые до сих пор спорят об этом, но структура снежинок всегда уникальна.",
  "Чистая вода не проводит электричество. Ток проводят примеси и соли, растворенные в ней.",
  "Самая дорогая вода в мире продается по цене около 60 000 долларов за бутылку в 750 мл (Acqua di Cristallo Tributo a Modigliani).",
  "При потере всего 2% воды от массы тела человек начинает испытывать сильную жажду.",
  "Вода — универсальный растворитель. Она может растворить почти любое твердое вещество со временем.",
  "Арбуз состоит из воды на 92%, а огурец — на 95%.",
  "В древнем Риме за порчу водопровода полагались огромные штрафы и даже смертная казнь.",
  "Первые деревянные трубы для водоснабжения в России появились еще в XI веке в Великом Новгороде.",
  "Счетчик воды помогает экономить бюджет семьи в среднем на 30–40% по сравнению с оплатой по нормативу.",
  "В Питкяранте расположено несколько уникальных месторождений гранита, которые влияют на минеральный состав подземных вод региона.",
  "Каждый раз, передавая показания вовремя, вы помогаете МКУ ПМО точнее планировать нагрузку на сети города."
];

export const OFFLINE_TEMPLATES = {
  phone: ORG_INFO.phone,
  greetings: [
    "Здравствуйте! Я Константин, помощник Хозуправления. Чем я вам помогу?",
    "Добрый день! Рад помочь с вопросами о воде, тарифах или услугах.",
    "Привет! Я на связи. Готов ответить на любые вопросы по ЖКХ.",
    "Здравствуйте! Что вас интересует? Я знаю всё о водоснабжении Питкяранты.",
    "Добрый день! Нужна помощь с передачей показаний, платежом или ещё чем-то?",
    "Приветствую! Это Константин. Спрашивайте — я знаю ответы на все вопросы!",
    "Здравствуйте! Я готов помочь с тарифами, показаниями, контактами и услугами.",
    "На связи Константин. Как ваши дела? Что нужно уточнить?"
  ],
  readings: [
    `Шаг 1: Авторизуйтесь в личном кабинете. Шаг 2: Перейдите в "Передать данные". Шаг 3: Введите показания счетчика ХВС и ГВС. Шаг 4: Нажмите отправить. Период: ${ORG_INFO.readingPeriod}.`,
    "Вводите только ТЕКУЩИЕ значения с счетчиков. Систему автоматически пересчитает объем и сумму к оплате.",
    "Показания принимаются ТОЛЬКО онлайн в личном кабинете в период с 18 по 25 число каждого месяца.",
    "Это займет всего 1-2 минуты! Откройте личный кабинет → вкладка 'Передать данные' → введите значения → сохраните.",
    "Если забыли пароль от кабинета, нажмите 'Восстановить пароль' на странице входа. Ссылка придет на почту за минуту.",
    "⚠️ Важно: если показания не переданы до 25 числа, расчет будет по среднему объему потребления!",
    "Передача доступна круглосуточно, но ТОЛЬКО в установленный период (18-25 число).",
    "Не нужно вводить разницу! Вводим показания, которые видны на счетчиках, а система сама всё посчитает.",
    "После успешной передачи показаний вы получите квитанцию в формате PDF сразу в личный кабинет.",
    "Первый раз передаете показания? В кабинете есть наглядные инструкции с фотографиями счетчиков."
  ],
  tariffs: [
    `✓ Холодная вода (ХВС): ${ORG_INFO.tariffs.cold}₽/м³\n✓ Горячая вода (ГВС): ${ORG_INFO.tariffs.hot}₽/м³\n✓ Водоотведение: ${ORG_INFO.tariffs.disposal}₽/м³\nВсе цены включают НДС.`,
    `Текущие тарифы для Питкяранты:\n• За куб холодной воды: ${ORG_INFO.tariffs.cold} рублей\n• За куб горячей воды: ${ORG_INFO.tariffs.hot} рублей\n• За водоотведение: ${ORG_INFO.tariffs.disposal} рублей`,
    "💡 Совет: счетчик помогает экономить на 30-40% по сравнению с нормативной оплатой!",
    "Специальная услуга подвоза воды доступна по цене " + ORG_INFO.tariffs.delivery + " рублей за 1 м³.",
    "Все тарифы утверждены администрацией Питкярантского района и действуют для всех жилых абонентов.",
    "Тарифы изменяются 1 раз в год. Последний пересчет был проведен в соответствии с постановлением администрации.",
    "На нашем сайте в разделе 'Информация' вы найдете все официальные документы о тарифах и сборах.",
    "Если вы получили квитанцию с необычной суммой, проверьте: на какой тариф рассчитана ваша квартира?"
  ],
  contacts: [
    `📞 ОСНОВНЫЕ КОНТАКТЫ:\n💥 Диспетчерская аварийно-диспетчерская служба: ${ORG_INFO.dispatchPhone} (24/7, без выходных)\n📱 Приемная/Справочная: ${ORG_INFO.phone}\n📧 Email: ${ORG_INFO.email}`,
    `☎️ Быстрые контакты:\n• Авария, протечка, нет воды → ${ORG_INFO.dispatchPhone}\n• Общие вопросы → ${ORG_INFO.phone}\n• Письмо, обращение → ${ORG_INFO.email}`,
    "🚨 АВАРИЙНАЯ СЛУЖБА работает 24/7 БЕЗ ВЫХОДНЫХ И ПРАЗДНИКОВ. Звоните в любой момент: " + ORG_INFO.dispatchPhone,
    "Рабочее время приемной: понедельник-пятница, 08:30-17:30 (обеденный перерыв 13:00-14:00). Звоните: " + ORG_INFO.phone,
    "Хотите написать официальное обращение? Отправьте на почту " + ORG_INFO.email + " или заполните форму 'Обратная связь' в кабинете.",
    "Связаться с нами можно также через раздел 'Обратная связь' в личном кабинете. Ответим в течение 3 рабочих дней.",
    "Для срочных проблем (авария, травма, газ) → " + ORG_INFO.dispatchPhone + ". Для плановых вопросов → " + ORG_INFO.phone,
    "Наши контакты доступны также на главной странице сайта и в нижней части всех страниц портала.",
    "Техническая поддержка сайта и личного кабинета работает в рабочее время. Вопросы о платежах решаются оперативно."
  ],
  address: [
    `🏢 НАШЕ МЕСТОПОЛОЖЕНИЕ:\n${ORG_INFO.address}\n\nРабочее время: ПН-ПТ 08:30-17:30 (обед 13:00-14:00)\nСБ-ВС: ВЫХОДНЫЕ`,
    `Адрес офиса: ${ORG_INFO.address}\nЦентр Питкяранты, легко найти по указателям МКУ ПМО.`,
    `Как найти: сторона центральной улицы Ленина, единственное здание МКУ ПМО "Хозяйственное управление".\nАдрес: ${ORG_INFO.address}`,
    "Мы принимаем граждан с понедельника по пятницу с 08:30 до 17:30. В субботу и воскресенье ВЫХОДНЫЕ.",
    "Перерыв на обед с 13:00 до 14:00. Лучше приходить с 09:00 до 12:00 или с 14:30 до 17:00.",
    "Интерактивная карта с нашим расположением есть на главной странице сайта.",
    "Парковка: перед зданием есть несколько мест для парковки.",
    "Заполучить результаты без визита: все справки можно отправить по почте " + ORG_INFO.email + " или через кабинет.",
    "Здание находится в одном комплексе с администрацией Питкярантского района.",
    "GPS координаты для навигатора: 61.5739° N, 31.4778° E. Или просто наберите 'МКУ ПМО Питкяранта'."
  ],
  thanks: [
    "Пожалуйста! Я всегда готов помочь. Обращайтесь, если еще что-то нужно!",
    "Рад помочь! Это моя работа и удовольствие — быть полезным жителям Питкяранты.",
    "Не за что! Если возникнут еще вопросы, я на связи 24/7.",
    "Было приятно общаться! Всех благ вам и вашей семье!",
    "Обращайтесь в любой момент. Я здесь, чтобы помогать!",
    "Спасибо за внимание и вежливость! Успехов вам!",
    "Пожалуйста! Питкяранта — замечательный город, и я рад быть здесь полезным!"
  ],
  farewells: [
    "До свидания! Удачи, и помните о сроках передачи показаний!",
    "Всего доброго! Не забудьте передать показания с 18 по 25 число.",
    "До встречи! Берегите воду и себя. Я всегда на помощь!",
    "Пока! Спасибо за внимание. Обращайтесь, если что-то понадобится.",
    "Хорошего дня! Помните: диспетчерская всегда на связи " + ORG_INFO.dispatchPhone,
    "До свидания! Пусть вода в вашем доме всегда течет как нужно.",
    "Удачи вам и вашей семье! До новых встреч в кабинете!"
  ],
  payment: [
    `💳 СПОСОБЫ ОПЛАТЫ:\n1️⃣ Онлайн в личном кабинете (карта, СБП, кошельки)\n2️⃣ По QR-коду из квитанции\n3️⃣ В отделении Почты России\n4️⃣ В Сбербанке\nВсе способы безопасны!`,
    `📲 Быстрая оплата:\nШаг 1: Откройте личный кабинет\nШаг 2: Перейдите в 'Оплата и счета'\nШаг 3: Нажмите 'Оплатить'\nШаг 4: Выберите способ и завершите платеж\nЗанимает меньше минуты!`,
    "✅ Онлайн-платежи: Мы принимаем все основные карты Visa, MasterCard, МИР, и платежи через СБП (СБП - быстро и удобно).",
    "🔒 Безопасность: Все платежи защищены 3D Secure. Ваши данные карты НЕ передаются нам, только в защищенный банковский шлюз.",
    "📋 Квитанция: После успешной оплаты квитанция автоматически сохранится в личном кабинете в формате PDF.",
    "🕐 Круглосуточно: Оплатить можно в любой день, в любой час. Система работает без выходных и праздников.",
    "📬 Офлайн способы: Если нет интернета, оплатите в отделении Почты России (комиссия обычно не требуется) или Сбербанка.",
    "⏳ Зачисление платежей: Обычно за 1-3 рабочих дня, в срочных случаях - за несколько часов.",
    "❓ Платеж не прошел? Проверьте: баланс карты, интернет-соединение, лимиты банка. Для срочной помощи звоните " + ORG_INFO.phone,
    "💯 Нужна квитанция об оплате? В кабинете хранится история всех платежей с документами за 3 года."
  ],
  emergency: [
    `🚨 ДЛЯ ЧРЕЗВЫЧАЙНЫХ СИТУАЦИЙ:\n⚡ НЕМЕДЛЕННО звоните: ${ORG_INFO.dispatchPhone}\nДиспетчерская 24/7 БЕЗ ВЫХОДНЫХ\n\n👉 Сообщите:\n- Адрес квартиры/дома\n- Тип проблемы (протечка, нет воды, запах)\n- Номер телефона\n\nБригада приедет оперативно!`,
    `🔴 СРОЧНО!\nЕсли протечка или авария → ${ORG_INFO.dispatchPhone}\nНе ждите, звоните СЕЙЧАС! Каждая минута важна!`,
    "💧 ПРОТЕЧКА? Шаг 1: Перекройте общий вентиль воды в квартире (обычно в ванной или под кухонной раковиной). Шаг 2: Звоните " + ORG_INFO.dispatchPhone,
    "⚠️ НЕТ ВОДЫ? Сообщите в диспетчерскую " + ORG_INFO.dispatchPhone + ". Обычно это плановое отключение или ремонт. Уточняем номер дома и срок восстановления.",
    "🔥 ЗАПАХ ГАРИ, ИСКРЫ в щитке или неисправность насоса? НЕМЕДЛЕННО прекратите водопотребление и звоните " + ORG_INFO.dispatchPhone,
    "🌡️ ВНИМАНИЕ: При аварии сетей горячей воды (ГВС) вода может быть ОЧЕНЬ ГОРЯЧЕЙ! Не прикасайтесь к неизвестным лужам и подтекам.",
    "👨‍🔧 Аварийная бригада Питкяранты работает 24/7 и выезжает в течение 30-40 минут от момента звонка.",
    "📍 Протечка в подъезде или на улице? Не трогайте! Сообщите нам по " + ORG_INFO.dispatchPhone + ". Это может быть опасно.",
    "💰 Ремонт авариаций внутри квартиры (внутридомовая разводка) оплачивается владельцем. В подъезде и на улице - за счет управления.",
    "📱 Если нет мобильного: используйте домашний телефон или попросите соседей позвонить. Авария не дождется!"
  ],
  compliments: [
    "Спасибо за доброту! Мне приятно общаться с такими вежливыми жителями Питкяранты.",
    "Ваша похвала вдохновляет меня быть еще полезнее! Дальше будет только лучше.",
    "Благодарю за такие слова! Это важно для развития нашего сервиса.",
    "Спасибо! Я стараюсь помогать всем максимально качественно и вежливо.",
    "Ваша похвала дарует мне энергию продолжать помогать! Спасибо за понимание."
  ],
  identity: [
    "Я — Константин, цифровой помощник МКУ ПМО 'Хозяйственное управление' Питкяранты. Готов помочь!",
    "Это я, Константин. Специалист по вопросам водоснабжения, тарифов и личного кабинета.",
    "Константин на связи. Я помогаю жителям Питкяранты с водой 24/7.",
    "Я — ИИ-помощник, созданный специально для уюта и удобства жителей нашего округа.",
    "Меня зовут Константин. Я знаю всё о показаниях, платежах, тарифах и контактах."
  ],
  period: [
    `⏰ СРОКИ ПЕРЕДАЧИ ПОКАЗАНИЙ:\n${ORG_INFO.readingPeriod}\n\n⚠️ ВАЖНО:\n• Передавайте показания В УСТАНОВЛЕННЫЙ ПЕРИОД\n• После 25-го числа система не принимает данные\n• Если не передали - оплачиваете по среднему объему`,
    `📅 Календарь:\n• Открытие периода: 18 число\n• Закрытие периода: 25 число\n• Выходные не исключаются (система работает 24/7)\n• В последний день (25-е) - пиковая нагрузка, передавайте ранее!`,
    "Период передачи показаний РОВНО " + ORG_INFO.readingPeriod + ". В эти дни вводите данные в личный кабинет.",
    "Показания принимаются ТОЛЬКО онлайн в установленный период. После 25 числа - передаёте по среднему тарифу.",
    "⏭️ Совет: передавайте показания с 18 по 22 число, не ждите последних дней, чтобы избежать сбоев в системе."
  ],
  service: [
    "📋 ДОСТУПНЫЕ УСЛУГИ:\n1. Поверка счетчика (требуется каждые 4 года)\n2. Замена неисправного счетчика\n3. Подвоз воды\n4. Установка счетчика\n\n👉 Заявку подавайте в разделе 'Мои услуги' в кабинете!",
    `📞 УСЛУГИ И РАСЦЕНКИ:\n• Поверка счетчика (в пределах кв-ры): бесплатно\n• Замена счетчика: ${ORG_INFO.tariffs.delivery} р. (включает материал)\n• Подвоз воды: ${ORG_INFO.tariffs.delivery}₽/м³`,
    "Заявку на услугу можно подать онлайн в личном кабинете (раздел 'Мои услуги') или позвонив " + ORG_INFO.phone + ".",
    "Счетчик старше 4 лет? Нужна поверка! Сообщите в управление, и мы организуем приезд мастера.",
    "Мастер придет в удобное для вас время в рабочее время управления (ПН-ПТ 09:00-17:00)."
  ],
  fallback: [
    "К сожалению, не совсем понимаю вопрос. Попробуйте спросить проще, например: 'Как передать показания?' или 'Какой тариф на воду?'",
    "Это выходит за рамки моих знаний. Я помогаю с вопросами о водоснабжении. Звоните в управление: " + ORG_INFO.phone + " (ПН-ПТ) или диспетчерская " + ORG_INFO.dispatchPhone + " (24/7).",
    "Мне не совсем ясен ваш вопрос. Спросите меня о: показаниях, тарифах, оплате, адресе, телефонах, услугах или сроках передачи.",
    "К сожалению, четкого ответа у меня нет. Позвоните в управление: " + ORG_INFO.phone + " (рабочее время) или в диспетчерскую: " + ORG_INFO.dispatchPhone + " (в любое время).",
    "Не могу полностью разобрать вопрос. Если это срочное - звоните диспетчерской " + ORG_INFO.dispatchPhone + ". Если плановое - звоните " + ORG_INFO.phone + ".",
    "Спросите меня о стандартных вопросах - я отвечу сразу. Для нестандартных вопросов нужна помощь специалиста: " + ORG_INFO.phone + ".",
    "Вопрос сложный для моего понимания. Напишите письмо в управление (" + ORG_INFO.email + ") или позвоните " + ORG_INFO.phone + ". Специалист ответит подробнее."
  ]
};

export const DEVELOPER_INFO = {
  name: 'Романов Максим',
  roles: 'Идея, разработка и поддержка сайта',
  telegram: '@ax_x_ax',
  email: 'max.strike@bk.ru',
  whatsapp: '+79114256880',
  telegramLink: 'https://t.me/ax_x_ax',
  whatsappLink: 'https://wa.me/79114256880'
};

export const PITKYARANTA_SETTLEMENTS = [
  'г. Питкяранта',
  'п. Салми',
  'п. Ляскеля',
  'п. Импилахти',
  'п. Харлу',
  'д. Хийденсельга',
  'д. Ряймяля',
  'п. Койриноя',
  'д. Мансила'
];

export const AVATAR_OPTIONS = [
  'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f0f9ff',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka&backgroundColor=f0f9ff',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Amaya&backgroundColor=f0f9ff',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Jameson&backgroundColor=f0f9ff',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Valentina&backgroundColor=f0f9ff',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Caleb&backgroundColor=f0f9ff',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Jocelyn&backgroundColor=f0f9ff',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Harrison&backgroundColor=f0f9ff'
];

export const THEME_OPTIONS = [
  { name: 'Синий', value: 'blue', color: '#2563eb' },
  { name: 'Зеленый', value: 'green', color: '#16a34a' },
  { name: 'Фиолетовый', value: 'purple', color: '#9333ea' },
  { name: 'Оранжевый', value: 'orange', color: '#ea580c' },
  { name: 'Индиго', value: 'indigo', color: '#4f46e5' },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    accountNumber: '100100',
    fullName: 'Иванов Иван Иванович',
    settlement: 'г. Питкяранта',
    address: 'ул. Ленина, д. 10, кв. 5',
    phone: '+7 900 111-22-33',
    email: 'ivanov@example.com',
    isAdmin: false,
    themeColor: 'blue',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f0f9ff',
    weatherProvider: 'open-meteo'
  },
  {
    id: 'u2',
    accountNumber: '100101',
    fullName: 'Петров Петр Петрович',
    settlement: 'г. Питкяранта',
    address: 'ул. Гоголя, д. 4, кв. 12',
    phone: '+7 921 000-01-01',
    email: 'petrov@pitk.ru',
    isAdmin: false,
    themeColor: 'green',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Caleb&backgroundColor=f0f9ff',
    weatherProvider: 'open-meteo'
  },
  {
    id: 'u3',
    accountNumber: '100102',
    fullName: 'Сидорова Анна Сергеевна',
    settlement: 'п. Салми',
    address: 'ул. Набережная, д. 15',
    phone: '+7 921 000-02-02',
    email: 'sidorova@pitk.ru',
    isAdmin: false,
    themeColor: 'purple',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Valentina&backgroundColor=f0f9ff'
  },
  {
    id: 'u4',
    accountNumber: '100103',
    fullName: 'Кузнецов Дмитрий Олегович',
    settlement: 'п. Ляскеля',
    address: 'ул. Заводская, д. 2, кв. 8',
    phone: '+7 921 000-03-03',
    email: 'kuznetsov@pitk.ru',
    isAdmin: false,
    themeColor: 'blue',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jameson&backgroundColor=f0f9ff'
  },
  {
    id: 'u5',
    accountNumber: '100104',
    fullName: 'Морозова Елена Владимировна',
    settlement: 'п. Импилахти',
    address: 'ул. Лесная, д. 10',
    phone: '+7 921 000-04-04',
    email: 'morozova@pitk.ru',
    isAdmin: false,
    themeColor: 'orange',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Amaya&backgroundColor=f0f9ff'
  },
  {
    id: 'u6',
    accountNumber: '100105',
    fullName: 'Васильев Артем Игоревич',
    settlement: 'п. Харлу',
    address: 'ул. Школьная, д. 5, кв. 3',
    phone: '+7 921 000-05-05',
    email: 'vasiliev@pitk.ru',
    isAdmin: false,
    themeColor: 'indigo',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Harrison&backgroundColor=f0f9ff'
  },
  {
    id: 'u7',
    accountNumber: '100106',
    fullName: 'Павлова Ольга Николаевна',
    settlement: 'д. Хийденсельга',
    address: 'ул. Озерная, д. 24',
    phone: '+7 921 000-06-06',
    email: 'pavlova@pitk.ru',
    isAdmin: false,
    themeColor: 'purple',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jocelyn&backgroundColor=f0f9ff'
  },
  {
    id: 'u8',
    accountNumber: '100107',
    fullName: 'Соколов Игорь Викторович',
    settlement: 'д. Ряймяля',
    address: 'ул. Центральная, д. 12',
    phone: '+7 921 000-07-07',
    email: 'sokolov@pitk.ru',
    isAdmin: false,
    themeColor: 'blue',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f0f9ff'
  },
  {
    id: 'u9',
    accountNumber: '100108',
    fullName: 'Попова Марина Александровна',
    settlement: 'п. Койриноя',
    address: 'ул. Дачная, д. 7',
    phone: '+7 921 000-08-08',
    email: 'popova@pitk.ru',
    isAdmin: false,
    themeColor: 'orange',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka&backgroundColor=f0f9ff'
  },
  {
    id: 'u10',
    accountNumber: '100109',
    fullName: 'Новиков Андрей Петрович',
    settlement: 'д. Мансила',
    address: 'ул. Пограничная, д. 3',
    phone: '+7 921 000-09-09',
    email: 'novikov@pitk.ru',
    isAdmin: false,
    themeColor: 'green',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Caleb&backgroundColor=f0f9ff'
  },
  {
    id: 'u11',
    accountNumber: '100110',
    fullName: 'Федорова Светлана Юрьевна',
    settlement: 'г. Питкяранта',
    address: 'ул. Победы, д. 21, кв. 45',
    phone: '+7 921 000-10-10',
    email: 'fedorova@pitk.ru',
    isAdmin: false,
    themeColor: 'purple',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Valentina&backgroundColor=f0f9ff'
  },
  {
    id: 'u12',
    accountNumber: '100111',
    fullName: 'Смирнов Алексей Михайлович',
    settlement: 'п. Салми',
    address: 'ул. Советская, д. 34',
    phone: '+7 921 000-11-11',
    email: 'smirnov@pitk.ru',
    isAdmin: false,
    themeColor: 'blue',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jameson&backgroundColor=f0f9ff'
  },
  {
    id: 'u13',
    accountNumber: '100112',
    fullName: 'Михайлова Наталья Викторовна',
    settlement: 'п. Ляскеля',
    address: 'ул. Новая, д. 8, кв. 2',
    phone: '+7 921 000-12-12',
    email: 'mihailova@pitk.ru',
    isAdmin: false,
    themeColor: 'green',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Amaya&backgroundColor=f0f9ff'
  },
  {
    id: 'u14',
    accountNumber: '100113',
    fullName: 'Волков Денис Сергеевич',
    settlement: 'п. Импилахти',
    address: 'ул. Речная, д. 2',
    phone: '+7 921 000-13-13',
    email: 'volkov@pitk.ru',
    isAdmin: false,
    themeColor: 'indigo',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Harrison&backgroundColor=f0f9ff'
  },
  {
    id: 'u15',
    accountNumber: '100114',
    fullName: 'Лебедева Ирина Анатольевна',
    settlement: 'п. Харлу',
    address: 'ул. Полевая, д. 14, кв. 1',
    phone: '+7 921 000-14-14',
    email: 'lebedeva@pitk.ru',
    isAdmin: false,
    themeColor: 'orange',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jocelyn&backgroundColor=f0f9ff'
  },
  {
    id: 'u16',
    accountNumber: '100115',
    fullName: 'Козлов Константин Дмитриевич',
    settlement: 'д. Хийденсельга',
    address: 'ул. Лесная, д. 10',
    phone: '+7 921 000-15-15',
    email: 'kozlov@pitk.ru',
    isAdmin: false,
    themeColor: 'blue',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f0f9ff'
  },
  {
    id: 'u17',
    accountNumber: '100116',
    fullName: 'Лаврентьев Сергей Анатольевич',
    settlement: 'д. Ряймяля',
    address: 'ул. Центральная, д. 18, кв. 4',
    phone: '+7 921 000-16-16',
    email: 'lavrentev@pitk.ru',
    isAdmin: false,
    themeColor: 'green',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Valentina&backgroundColor=f0f9ff'
  },
  {
    id: 'u18',
    accountNumber: '100117',
    fullName: 'Герасимова Татьяна Геннадьевна',
    settlement: 'п. Койриноя',
    address: 'ул. Советская, д. 26',
    phone: '+7 921 000-17-17',
    email: 'gerasimova@pitk.ru',
    isAdmin: false,
    themeColor: 'indigo',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Amaya&backgroundColor=f0f9ff'
  },
  {
    id: 'u19',
    accountNumber: '100118',
    fullName: 'Соколовский Евгений Владимирович',
    settlement: 'д. Мансила',
    address: 'ул. Пограничная, д. 9',
    phone: '+7 921 000-18-18',
    email: 'sokolovskiy@pitk.ru',
    isAdmin: false,
    themeColor: 'purple',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jameson&backgroundColor=f0f9ff'
  },
  {
    id: 'u20',
    accountNumber: '100119',
    fullName: 'Вавилина Виктория Павловна',
    settlement: 'г. Питкяранта',
    address: 'ул. Комсомольца, д. 7, кв. 18',
    phone: '+7 921 000-19-19',
    email: 'vavilina@pitk.ru',
    isAdmin: false,
    themeColor: 'orange',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Caleb&backgroundColor=f0f9ff'
  },
  {
    id: 'u21',
    accountNumber: '100120',
    fullName: 'Крылов Борис Игоревич',
    settlement: 'п. Салми',
    address: 'ул. Набережная, д. 21, кв. 6',
    phone: '+7 921 000-20-20',
    email: 'krylov@pitk.ru',
    isAdmin: false,
    themeColor: 'blue',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Harrison&backgroundColor=f0f9ff'
  },
  {
    id: 'u22',
    accountNumber: '100121',
    fullName: 'Матвеева Людмила Игоревна',
    settlement: 'п. Ляскеля',
    address: 'ул. Школьная, д. 11, кв. 3',
    phone: '+7 921 000-21-21',
    email: 'matveeva@pitk.ru',
    isAdmin: false,
    themeColor: 'green',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jocelyn&backgroundColor=f0f9ff'
  },
  {
    id: 'u23',
    accountNumber: '100122',
    fullName: 'Беличенко Максим Юрьевич',
    settlement: 'п. Импилахти',
    address: 'ул. Ленина, д. 5',
    phone: '+7 921 000-22-22',
    email: 'belichenko@pitk.ru',
    isAdmin: false,
    themeColor: 'purple',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=f0f9ff'
  },
  {
    id: 'u24',
    accountNumber: '100123',
    fullName: 'Чабина Екатерина Дмитриевна',
    settlement: 'п. Харлу',
    address: 'ул. Третьей Пятилетки, д. 13, кв. 7',
    phone: '+7 921 000-23-23',
    email: 'chabina@pitk.ru',
    isAdmin: false,
    themeColor: 'orange',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka&backgroundColor=f0f9ff'
  },
  {
    id: 'u25',
    accountNumber: '100124',
    fullName: 'Морозов Владимир Александрович',
    settlement: 'д. Хийденсельга',
    address: 'ул. Озерная, д. 31, кв. 2',
    phone: '+7 921 000-24-24',
    email: 'morozov@pitk.ru',
    isAdmin: false,
    themeColor: 'indigo',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Valentina&backgroundColor=f0f9ff'
  },
  {
    id: 'u26',
    accountNumber: '100125',
    fullName: 'Синицына Наталья Олеговна',
    settlement: 'д. Ряймяля',
    address: 'ул. Лесная, д. 15',
    phone: '+7 921 000-25-25',
    email: 'sinitsina@pitk.ru',
    isAdmin: false,
    themeColor: 'blue',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Amaya&backgroundColor=f0f9ff'
  },
  {
    id: 'u27',
    accountNumber: '100126',
    fullName: 'Денисов Валентин Сергеевич',
    settlement: 'п. Койриноя',
    address: 'ул. Центральная, д. 28, кв. 5',
    phone: '+7 921 000-26-26',
    email: 'denisov@pitk.ru',
    isAdmin: false,
    themeColor: 'green',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jameson&backgroundColor=f0f9ff'
  },
  {
    id: 'u28',
    accountNumber: '100127',
    fullName: 'Зубарева Мария Константиновна',
    settlement: 'д. Мансила',
    address: 'ул. Колхозная, д. 4',
    phone: '+7 921 000-27-27',
    email: 'zubareva@pitk.ru',
    isAdmin: false,
    themeColor: 'purple',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Harrison&backgroundColor=f0f9ff'
  },
  {
    id: 'u29',
    accountNumber: '100128',
    fullName: 'Корнилов Юрий Викторович',
    settlement: 'г. Питкяранта',
    address: 'ул. Парковая, д. 16, кв. 33',
    phone: '+7 921 000-28-28',
    email: 'kornilov@pitk.ru',
    isAdmin: false,
    themeColor: 'orange',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Caleb&backgroundColor=f0f9ff'
  },
  {
    id: 'u30',
    accountNumber: '100129',
    fullName: 'Лапина Марина Юрьевна',
    settlement: 'п. Салми',
    address: 'ул. Лесная, д. 12, кв. 11',
    phone: '+7 921 000-29-29',
    email: 'lapina@pitk.ru',
    isAdmin: false,
    themeColor: 'indigo',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jocelyn&backgroundColor=f0f9ff'
  },
  {
    id: 'admin',
    accountNumber: 'ADMIN',
    fullName: 'Администратор Системы',
    settlement: 'г. Питкяранта',
    address: 'ул. Ленина, д. 13',
    phone: '+7 921 466-82-39',
    email: 'pitkaranta_hoz@mail.ru',
    isAdmin: true
  }
];

export const INITIAL_READINGS = [
  { id: 'r1', userId: 'u1', coldWater: 120, hotWater: 45, submissionDate: '2023-10-20T10:00:00Z' },
  { id: 'r2', userId: 'u1', coldWater: 125, hotWater: 48, submissionDate: '2023-11-19T10:00:00Z' },
  { id: 'r3', userId: 'u1', coldWater: 132, hotWater: 52, submissionDate: '2023-12-22T10:00:00Z' },
];
