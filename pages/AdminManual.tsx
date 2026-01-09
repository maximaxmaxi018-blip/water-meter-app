
import React, { useEffect } from 'react';
import { ORG_INFO } from '../constants';

interface AdminManualProps {
  onBack: () => void;
}

const AdminManual: React.FC<AdminManualProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const steps = [
    {
      title: "1. Управление абонентской базой",
      icon: "fa-users-gear",
      description: "Поддержание актуального реестра жителей и организаций Питкярантского округа.",
      details: [
        "Добавление новых абонентов производится вручную. При вводе Л/С система проверяет уникальность номера.",
        "Для активации личного кабинета жителя достаточно добавить его Л/С в базу. Пароль создастся автоматически при его первом входе.",
        "В карточке абонента можно редактировать ФИО, адрес, телефон и поселение. Пароль можно сбросить или изменить по просьбе жителя.",
        "Управление историей показаний доступно по клику на ФИО абонента в общем списке: там можно добавлять забытые данные или удалять ошибочные записи.",
        "ДВОЙНЫЕ СЧЕТЧИКИ: Некоторые абоненты (коммерческие помещения, многоквартирные дома, здания с раздельными системами учета) имеют по 2 счетчика холодной воды (ХВС) и 2 счетчика горячей воды (ГВС). При редактировании профиля абонента установите галочку «По 2 счетчика ХВС и ГВС».",
        "После установки этой галочки: (1) абонент увидит 4 поля ввода вместо 2 в своем личном кабинете; (2) при добавлении показаний в админ-панели появятся дополнительные поля для второго счетчика; (3) история показаний будет отображать все счетчики отдельно; (4) квитанция и CSV экспорт будут содержать полную информацию о всех 4 счетчиках с разбивкой по №1 и №2.",
        "Система автоматически рассчитывает оплату, суммируя расходы всех счетчиков и применяя тариф на водоотведение к общему объему."
      ]
    },
    {
      title: "2. Работа с юридическими лицами (ЮЛ/ИП)",
      icon: "fa-building-circle-check",
      description: "Особенности учета коммерческих потребителей и бюджетных учреждений.",
      details: [
        "При создании или редактировании абонента выберите тип «Юридическое лицо» для доступа к полям ИНН и названию компании.",
        "Поддерживаются формы собственности: ИП, ООО, АО, ПАО, а также ТСЖ и муниципальные учреждения (МКУ, МАУ).",
        "В общем реестре юридические лица помечаются иконкой здания. Счета для них формируются с указанием полных реквизитов организации.",
        "Статистика по количеству ЮЛ и ИП автоматически попадает в аналитический отчет для руководства."
      ]
    },
    {
      title: "3. Обработка сервисных заявок",
      icon: "fa-clipboard-check",
      description: "Контроль выполнения работ по поверке, замене и подвозу воды.",
      details: [
        "Новые заявки появляются во вкладке «Заявки» с пометкой «Новая». Обязательно свяжитесь с абонентом для подтверждения времени.",
        "Статус «В работе» сигнализирует абоненту, что мастер назначен. Статус «Готова» завершает цикл заявки.",
        "Для заявок на подвоз воды предусмотрена генерация счета на оплату (PDF) — кнопка доступна в деталях заявки.",
        "После выполнения работ по подвозу рекомендуется зафиксировать фактический объем для корректного отображения в отчетах."
      ]
    },
    {
      title: "4. Управление сантехниками и назначение на заявки",
      icon: "fa-wrench",
      description: "Организация работы специалистов по поверке и замене счетчиков.",
      details: [
        "Во вкладке «Сантехники» содержится полный реестр всех работников, занимающихся сервисным обслуживанием счетчиков и подвозом воды.",
        "Каждый сантехник имеет специализацию: «Поверка счетчиков», «Замена счетчиков» или «Универсальный специалист» (может выполнять все виды работ).",
        "Для добавления нового сотрудника нажмите кнопку «+ Добавить» и заполните профиль: ФИО, телефон, email и специализацию. Активируйте флаг «Активен» для доступа к новым заявкам.",
        "Назначить исполнителя можно двумя способами: 1) Открыть заявку в разделе «Заявки» → нажать «Назначить исполнителя» → выбрать сантехника; 2) В разделе «Сантехники» внизу находится список всех заявок с быстрым назначением.",
        "При назначении система автоматически фиксирует время назначения и ФИО исполнителя. Вы можете переназначить заявку на другого мастера в любой момент.",
        "На карточке каждого сантехника отображается статистика: количество заявок в работе и выполненных — это помогает балансировать нагрузку между работниками.",
        "Неактивных сотрудников можно деактивировать (они не будут видны при назначении), но их данные сохранятся для истории назначений."
      ]
    },
    {
      title: "5. Публикация новостей и оповещений",
      icon: "fa-bullhorn",
      description: "Информирование жителей об авариях и плановых работах.",
      details: [
        "Тип «Авария» (Emergency): Публикация приводит к появлению индикатора тревоги на главной странице абонентов.",
        "Тип «Инфо» и «Плановые работы»: Используются для уведомления о проверках или графиках отключения.",
        "Вы можете привязать новость к конкретному поселению (например, только для п. Салми) для адресного информирования.",
        "Регулярно удаляйте неактуальные новости, чтобы не вводить жителей в заблуждение."
      ]
    },
    {
      title: "6. Аналитика и отчеты для руководства",
      icon: "fa-chart-pie",
      description: "Формирование официальной документации и выгрузка данных для учета.",
      details: [
        "Во вкладке «Отчеты» доступны три режима фильтрации: День, Месяц и Весь период.",
        "«Реестр показаний (CSV)» — полная выгрузка данных по всем абонентам для бухгалтерии и импорта в расчетные системы. Для абонентов с двойными счетчиками будут экспортированы все 4 значения: ХВС №1, ГВС №1, ХВС №2, ГВС №2. Для обычных абонентов колонки №2 будут содержать прочерк (—).",
        "«Аналитическая справка (PDF)» — официальный документ для директора МКУ ПМО. Формируется в строгом соответствии с фирменным бланком организации.",
        "Справка содержит ключевые KPI: общее число абонентов, охват приборами учета, статистику по типам сервисных заявок и суммарный объем подвезенной воды.",
        "Перед скачиванием справки обязательно выберите нужный период, так как все цифры пересчитываются «на лету»."
      ]
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-950 py-16 animate-in fade-in duration-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-left">
          <span className="hover:text-primary-600 cursor-pointer transition-colors" onClick={onBack}>Панель управления</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-gray-100">Инструкция администратора</span>
        </nav>

        <header className="mb-16 text-left">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6">
            Панель <br/><span className="text-indigo-600">администрирования</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-3xl">
            Данное руководство предназначено для сотрудников МКУ ПМО "Хозуправление". Здесь описаны основные процессы управления порталом и взаимодействия с абонентами всех категорий.
          </p>
        </header>

        <div className="space-y-16 relative text-left">
          <div className="absolute left-[20px] top-10 bottom-10 w-0.5 bg-indigo-50 dark:bg-indigo-900/20 hidden md:block"></div>

          {steps.map((step, idx) => (
            <section key={idx} className="relative md:pl-20 group">
              <div className="md:absolute left-0 top-0 w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl border border-indigo-50 dark:border-indigo-900 z-10 mb-4 md:mb-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                <i className={`fas ${step.icon} text-lg`}></i>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/30 p-8 md:p-10 rounded-[2.5rem] border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-500 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{step.title}</h2>
                <p className="text-lg text-indigo-600 dark:text-indigo-400 font-bold mb-6 italic">
                  {step.description}
                </p>
                
                <ul className="space-y-4">
                  {step.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start space-x-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        {dIdx + 1}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        {detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-24 p-12 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
            <div>
              <h3 className="text-3xl font-black mb-4">Техническая поддержка</h3>
              <p className="text-gray-400 font-medium max-w-md">
                При возникновении ошибок в работе базы данных или системных сбоях, пожалуйста, свяжитесь с разработчиком системы.
              </p>
            </div>
            <div className="flex gap-4 shrink-0">
               <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                  <div className="text-[10px] font-black uppercase opacity-50 mb-2 text-white">Разработчик</div>
                  <div className="text-lg font-black text-indigo-400">Романов Максим</div>
                  <div className="text-xs font-bold text-white mt-1">@ax_x_ax (Telegram)</div>
               </div>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 opacity-5 rotate-12">
            <i className="fas fa-shield-halved text-[250px] text-white"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManual;
