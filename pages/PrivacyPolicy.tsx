
import React, { useEffect } from 'react';
import { ORG_INFO } from '../constants';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "1. Общие положения",
      icon: "fa-info-circle",
      content: `Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые ${ORG_INFO.name} (далее — Оператор).`
    },
    {
      title: "2. Персональные данные, которые мы обрабатываем",
      icon: "fa-user-shield",
      content: "Оператор может обрабатывать следующие персональные данные Пользователя: Фамилия, имя, отчество; Номер телефона; Адрес электронной почты; Адрес жилого помещения (место регистрации/пребывания); Номер лицевого счета; Данные приборов учета (показания счетчиков)."
    },
    {
      title: "3. Цели обработки персональных данных",
      icon: "fa-bullseye",
      content: "Цель обработки персональных данных Пользователя — информирование Пользователя посредством отправки электронных писем; предоставление доступа Пользователю к сервисам, информации и/или материалам, содержащимся на веб-сайте; расчет стоимости коммунальных услуг; прием показаний приборов учета; обработка заявок на поверку и замену оборудования."
    },
    {
      title: "4. Правовые основания обработки",
      icon: "fa-gavel",
      content: "Оператор обрабатывает персональные данные Пользователя только в случае их заполнения и/или отправки Пользователем самостоятельно через специальные формы, расположенные на сайте. Заполняя соответствующие формы и/или отправляя свои персональные данные Оператору, Пользователь выражает свое согласие с данной Политикой."
    },
    {
      title: "5. Порядок сбора, хранения и передачи",
      icon: "fa-database",
      content: "Безопасность персональных данных, которые обрабатываются Оператором, обеспечивается путем реализации правовых, организационных и технических мер, необходимых для выполнения в полном объеме требований действующего законодательства в области защиты персональных данных. Оператор обеспечивает сохранность персональных данных и принимает все возможные меры, исключающие доступ к персональным данным неуполномоченных лиц."
    },
    {
      title: "6. Права пользователя",
      icon: "fa-user-check",
      content: "Пользователь имеет право на получение информации, касающейся обработки его персональных данных, требовать уточнения своих персональных данных, их блокирования или уничтожения в случае, если данные являются неполными, устаревшими, неточными или незаконно полученными."
    },
    {
      title: "7. Заключительные положения",
      icon: "fa-file-contract",
      content: `Пользователь может получить любые разъяснения по интересующим вопросам, касающимся обработки его персональных данных, обратившись к Оператору по электронной почте ${ORG_INFO.email} или по адресу: ${ORG_INFO.address}. Настоящий документ будет отражать любые изменения политики обработки персональных данных Оператором. Политика действует бессрочно до замены ее новой версией.`
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-950 py-16 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <span className="hover:text-primary-600 cursor-pointer transition-colors" onClick={onBack}>Главная</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-gray-100">Политика конфиденциальности</span>
        </nav>

        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-6">
            Политика <span className="text-primary-600">конфиденциальности</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            Мы серьезно относимся к безопасности ваших данных. Ознакомьтесь с тем, как {ORG_INFO.name} собирает, использует и защищает вашу личную информацию.
          </p>
          <div className="mt-8 flex items-center space-x-4">
             <div className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-full border border-primary-100 dark:border-primary-800 text-[10px] font-black text-primary-600 uppercase tracking-widest">
               Последнее обновление: 1 января 2026
             </div>
          </div>
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

        <div className="mt-20 p-10 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 text-center">
          <h3 className="text-xl font-black mb-4">Остались вопросы?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Если у вас возникли вопросы по поводу обработки ваших данных, свяжитесь с нашей службой поддержки.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={`mailto:${ORG_INFO.email}`} className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20">
              Написать на почту
            </a>
            <div className="text-sm font-black text-gray-900 dark:text-white">
              {ORG_INFO.phone}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
