
import React, { useEffect } from 'react';
import { ORG_INFO } from '../constants';

interface TermsOfUseProps {
  onBack: () => void;
}

const TermsOfUse: React.FC<TermsOfUseProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "1. Предмет соглашения",
      icon: "fa-handshake",
      content: `Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между ${ORG_INFO.name} (далее — Администрация) и физическим лицом (далее — Пользователь) по использованию веб-сервиса для передачи показаний приборов учета воды и заказа сопутствующих услуг.`
    },
    {
      title: "2. Регистрация и доступ",
      icon: "fa-key",
      content: "Доступ к личному кабинету осуществляется по номеру лицевого счета. При первом входе система генерирует временный пароль, который Пользователь обязан сохранить. Пользователь несет полную ответственность за сохранность своих учетных данных и любые действия, совершенные под его учетной записью."
    },
    {
      title: "3. Правила передачи показаний",
      icon: "fa-faucet-drip",
      content: `Пользователь обязуется передавать достоверные показания приборов учета воды в установленные сроки: ${ORG_INFO.readingPeriod}. Передача заведомо ложных данных может привести к перерасчету стоимости услуг в соответствии с действующим законодательством РФ.`
    },
    {
      title: "4. Заказ услуг (Поверка и замена)",
      icon: "fa-tools",
      content: "Оформляя заявку на поверку или замену счетчиков, Пользователь подтверждает свое согласие на визит специалиста в указанное время. Администрация обязуется связаться с Пользователем для подтверждения деталей заявки. Стоимость услуг определяется действующими тарифами на момент оказания услуги."
    },
    {
      title: "5. Ограничение ответственности",
      icon: "fa-shield-halved",
      content: "Администрация не несет ответственности за временные сбои в работе сервиса, вызванные техническими причинами или действиями третьих лиц. Сервис предоставляется на условиях «как есть». Администрация прилагает все усилия для обеспечения бесперебойной работы, но не гарантирует абсолютную доступность 24/7."
    },
    {
      title: "6. Изменение условий",
      icon: "fa-edit",
      content: "Администрация оставляет за собой право в одностороннем порядке изменять условия настоящего Соглашения. Новая редакция вступает в силу с момента ее публикации на сайте. Продолжение использования сервиса после внесения изменений означает согласие Пользователя с новыми условиями."
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-950 py-16 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <span className="hover:text-primary-600 cursor-pointer transition-colors" onClick={onBack}>Главная</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-gray-100">Условия использования</span>
        </nav>

        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-6">
            Условия <span className="text-primary-600">использования</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            Пожалуйста, внимательно ознакомьтесь с правилами использования нашего онлайн-портала. Используя сервис, вы принимаете данные условия.
          </p>
        </header>

        <div className="space-y-12">
          {sections.map((section, idx) => (
            <section key={idx} className="relative pl-12 group">
              <div className="absolute left-0 top-0 w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-sm border border-gray-100 dark:border-gray-800">
                <i className={`fas ${section.icon} text-sm`}></i>
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">{section.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-20 p-10 bg-gray-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 text-center">
            <h3 className="text-2xl font-black mb-4">Юридическая информация</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm">
              Все споры, возникающие в рамках настоящего соглашения, разрешаются в соответствии с законодательством Российской Федерации.
            </p>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
              {ORG_INFO.name} • {ORG_INFO.location}
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary-600/20 rounded-full blur-[100px]"></div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
