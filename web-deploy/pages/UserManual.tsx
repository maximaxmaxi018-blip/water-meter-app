
import React, { useEffect } from 'react';
import { ORG_INFO } from '../constants';

interface UserManualProps {
  onBack: () => void;
}

const UserManual: React.FC<UserManualProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const steps = [
    {
      title: "Шаг 1: Доступ к кабинету",
      icon: "fa-key",
      description: "Безопасный вход по лицевому счету для жителей и бизнеса.",
      details: [
        "Вашим логином является номер лицевого счета (6 цифр), указанный в вашей квитанции или договоре.",
        "Для физических лиц в профиле отображается ФИО, для юридических — название организации (напр. ООО «Вектор») и тип собственности.",
        "Если вы заходите впервые, оставьте поле пароля пустым — система сама создаст надежный ключ доступа.",
        "Обязательно сохраните сгенерированный пароль. В личном кабинете его можно изменить в разделе «Мой профиль»."
      ]
    },
    {
      title: "Шаг 2: Передача показаний и оплата",
      icon: "fa-faucet-drip",
      description: "Удобный способ передачи данных ХВС/ГВС с моментальным получением счета.",
      details: [
        "Передавайте данные ежемесячно с 18 по 25 число для корректного расчета начислений.",
        "После отправки данных система сформирует PDF-квитанцию. Для юрлиц в документе автоматически прописывается ИНН и полное наименование.",
        "QR-код в квитанции позволяет оплатить услуги за секунды через любое банковское приложение без ручного ввода реквизитов.",
        "Юридические лица могут использовать сформированные квитанции для оплаты через корпоративный расчетный счет."
      ]
    },
    {
      title: "Шаг 3: Заявки и рабочий график",
      icon: "fa-clock",
      description: "Правила оформления вызова мастера и заказа подвоза воды.",
      details: [
        `Выезд специалистов и обработка заявок осуществляются в рабочее время: с 08:30 до 17:30 (Пн-Пт).`,
        "Система автоматически проверяет выбранное вами время и предупредит, если оно выпадает на выходной день.",
        "Для коммерческих объектов (магазины, кафе, мастерские) возможен заказ увеличенного объема подвоза воды.",
        "Статус выполнения заявки («В работе», «Выполнено») отображается в реальном времени в верхней части вашего кабинета."
      ]
    },
    {
      title: "Шаг 4: Помощник Константин (ИИ)",
      icon: "fa-robot",
      description: "Ваш персональный круглосуточный ассистент на базе искусственного интеллекта.",
      details: [
        "В правом нижнем углу экрана всегда доступен Константин — наш интеллектуальный помощник.",
        "Он знает всё о тарифах для населения и промышленных зон, сроках подачи данных и контактах всех служб.",
        "Константин может рассчитать стоимость услуг или объяснить, как действовать в аварийной ситуации.",
        "Если ИИ не сможет ответить на сложный вопрос, он мгновенно предоставит прямой телефон диспетчера."
      ]
    },
    {
      title: "Шаг 5: Для юридических лиц и ИП",
      icon: "fa-building-shield",
      description: "Специальные возможности для управления корпоративными лицевыми счетами.",
      details: [
        "Если ваш аккаунт имеет статус юридического лица, вы можете внести ИНН организации для корректного оформления платежных документов.",
        "Поддерживаются все основные формы собственности: ИП, ООО, АО, ПАО, а также ТСЖ и муниципальные учреждения (МКУ, МАУ).",
        "История всех начислений и скачанных актов доступна в архиве в течение 3-х лет.",
        "При необходимости смены реквизитов или типа организации, обратитесь в бухгалтерию Хозуправления через раздел «Обратная связь»."
      ]
    },
    {
      title: "Шаг 6: Обратная связь",
      icon: "fa-comment-dots",
      description: "Прямой канал связи с администрацией для решения любых вопросов.",
      details: [
        "Если вы столкнулись с ошибкой в данных или у вас есть идеи по улучшению портала, напишите нам.",
        "Ваше сообщение поступит напрямую специалистам МКУ ПМО «Хозуправление» для оперативного рассмотрения.",
        "Ответ будет направлен на электронную почту, указанную в настройках вашего профиля.",
        "Мы ценим ваше участие в развитии цифровой среды Питкярантского муниципального округа."
      ]
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-950 py-16 animate-in fade-in duration-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-left">
          <span className="hover:text-primary-600 cursor-pointer transition-colors" onClick={onBack}>Главная</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-gray-100">Инструкция пользователя</span>
        </nav>

        <header className="mb-16 text-left">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6">
            Как работает <br/><span className="text-primary-600">наш сервис?</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-3xl">
            Портал объединяет жителей и бизнес Питкяранты. Мы сделали всё, чтобы управление коммунальными ресурсами стало прозрачным для каждого абонента.
          </p>
        </header>

        <div className="space-y-20 relative text-left">
          <div className="absolute left-[20px] top-10 bottom-10 w-0.5 bg-gray-100 dark:bg-gray-800 hidden md:block"></div>

          {steps.map((step, idx) => (
            <section key={idx} className="relative md:pl-20 group">
              <div className="md:absolute left-0 top-0 w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-primary-600 shadow-xl border border-primary-50 dark:border-primary-900 z-10 mb-4 md:mb-0 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                <i className={`fas ${step.icon} text-lg`}></i>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-8 md:p-10 rounded-[2.5rem] border border-transparent hover:border-primary-100 dark:hover:border-primary-900 transition-all duration-500 shadow-sm hover:shadow-md">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{step.title}</h2>
                <p className="text-lg text-primary-600 dark:text-primary-400 font-bold mb-6 italic leading-relaxed">
                  {step.description}
                </p>
                
                <ul className="space-y-4">
                  {step.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start space-x-4">
                      <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        {dIdx + 1}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                        {detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-24 p-12 bg-gradient-to-br from-primary-600 to-blue-500 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-black mb-4">Нужна помощь специалиста?</h3>
              <p className="text-white/80 font-medium max-w-md">
                Для бизнеса и частных лиц работает круглосуточная диспетчерская служба и офис приема граждан.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
               <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
                  <div className="text-[10px] font-black uppercase opacity-60 mb-1 text-white">Аварийная (24/7)</div>
                  <div className="text-xl font-black text-white">{ORG_INFO.dispatchPhone}</div>
               </div>
               <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
                  <div className="text-[10px] font-black uppercase opacity-60 mb-1 text-white">Офис ПМК ПМО</div>
                  <div className="text-xl font-black text-white">{ORG_INFO.phone}</div>
               </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10 rotate-[-15deg]">
            <i className="fas fa-question-circle text-[250px] text-white"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
