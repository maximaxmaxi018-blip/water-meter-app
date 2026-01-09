
import React, { useState, useEffect } from 'react';
import { ORG_INFO } from '../constants';
import { NewsItem } from '../types';

interface LandingPageProps {
  onLogin: (accountNumber: string, password?: string) => void;
  firstTimePassword: string | null;
  onClosePasswordModal: () => void;
  loginError: string | null;
  isNewYear: boolean;
  news: NewsItem[];
  onTriggerFireworks: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onLogin, 
  firstTimePassword, 
  onClosePasswordModal, 
  loginError, 
  isNewYear, 
  news,
  onTriggerFireworks
}) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [easterEggClicks, setEasterEggClicks] = useState(0);

  const handleEasterEggClick = () => {
    const newCount = easterEggClicks + 1;
    if (newCount >= 3) {
      onTriggerFireworks();
      setEasterEggClicks(0);
    } else {
      setEasterEggClicks(newCount);
      setTimeout(() => setEasterEggClicks(0), 2000);
    }
  };

  const avatarUrls = [
    'https://images.unsplash.com/photo-1544168190-79c17527004f?q=80&w=150&h=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=150&h=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&h=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=150&h=150&auto=format&fit=crop'
  ];

  const getNewsTypeStyles = (type: string) => {
    switch(type) {
      case 'emergency': return 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400';
      case 'planned': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400';
    }
  };

  const getNewsIcon = (type: string) => {
    switch(type) {
      case 'emergency': return 'fa-exclamation-triangle animate-pulse';
      case 'planned': return 'fa-tools';
      default: return 'fa-info-circle';
    }
  };

  const activeEmergencies = news.filter(n => n.type === 'emergency').length;

  const benefits = [
    {
      icon: 'fa-bolt-lightning',
      title: 'Мгновенно',
      desc: 'Передача показаний занимает менее 30 секунд без очередей.'
    },
    {
      icon: 'fa-file-invoice-dollar',
      title: 'Прозрачно',
      desc: 'История всех начислений и скачивание квитанций с QR-кодом.'
    },
    {
      icon: 'fa-headset',
      title: '24/7 Поддержка',
      desc: 'Чат-бот Константин и круглосуточная диспетчерская служба.'
    },
    {
      icon: 'fa-mobile-screen-button',
      title: 'Удобно',
      desc: 'Адаптивный интерфейс: управляйте ЖКХ со смартфона или ПК.'
    }
  ];

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-950">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary-100/50 dark:bg-primary-900/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-[150px] animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 md:pt-32 md:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 text-center lg:text-left">
            <div 
              onClick={handleEasterEggClick}
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider animate-bounce cursor-pointer hover:scale-105 transition-transform active:scale-95 select-none"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              <span>{isNewYear ? '🎉 С наступающим Новым Годом!' : 'Официальный сервис г. Питкяранта'}</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              Ваша вода под <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-400">умным контролем</span>
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Портал {ORG_INFO.name} для мгновенной передачи показаний и управления ресурсами дома.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <div className="flex -space-x-3">
                {avatarUrls.map((url, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-md">
                    <img src={url} alt={`Абонент ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-500">
                <span className="text-gray-900 dark:text-gray-200 font-bold">5,000+</span> абонентов с нами
              </p>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div id="tutorial-login" className="relative z-20 w-full max-w-md p-1 bg-gradient-to-br from-primary-400/20 to-blue-400/20 rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
              <div className="bg-white/90 dark:bg-gray-900/90 rounded-[2.3rem] p-10 backdrop-blur-md">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-xl">
                    <i className="fas fa-sign-in-alt"></i>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Личный кабинет</h3>
                </div>

                <div className="space-y-5">
                  {loginError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center space-x-3 text-red-600 dark:text-red-400 text-xs font-bold animate-in fade-in duration-300">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Лицевой счет</label>
                    <div className="group relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-primary-600 transition-colors">
                        <i className="fas fa-id-card"></i>
                      </span>
                      <input 
                        type="text" 
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onLogin(accountNumber, password)}
                        placeholder="Введите ваш лицевой счет"
                        className="block w-full pl-12 pr-4 py-4 border-2 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white font-bold transition-all outline-none border-gray-100 dark:border-gray-800 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Пароль</label>
                    <div className="group relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-primary-600 transition-colors">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onLogin(accountNumber, password)}
                        placeholder="Оставьте пусто при первом входе"
                        className="block w-full pl-12 pr-12 py-4 border-2 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white font-bold transition-all outline-none border-gray-100 dark:border-gray-800 focus:border-primary-500"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-all z-10"
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onLogin(accountNumber, password)}
                    disabled={!accountNumber.trim()}
                    className="group w-full bg-gray-900 dark:bg-primary-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-800 dark:hover:bg-primary-500 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900 dark:disabled:hover:bg-primary-600"
                  >
                    <span>Войти в кабинет</span>
                    <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b, idx) => (
            <div key={idx} className="p-8 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-[2rem] hover:bg-white dark:hover:bg-gray-900 hover:-translate-y-2 hover:shadow-2xl hover:border-primary-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                <i className={`fas ${b.icon}`}></i>
              </div>
              <h4 className="text-lg font-black mb-2 text-gray-900 dark:text-white">{b.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        <div id="tutorial-news" className="py-24 border-t border-gray-100 dark:border-gray-900 scroll-mt-24">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
            <div className="space-y-4 max-w-xl text-left">
              <h3 className="text-xs font-black text-primary-600 uppercase tracking-[0.3em]">Важные новости и объявления</h3>
              <h4 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">Оперативная информация</h4>
            </div>
            <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border-2 transition-all hover:scale-105 ${activeEmergencies > 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'}`}>
              <div className={`w-3 h-3 rounded-full ${activeEmergencies > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-sm font-black uppercase tracking-widest">
                {activeEmergencies > 0 ? `Активных аварий: ${activeEmergencies}` : 'Штатный режим'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((item) => (
              <div key={item.id} className={`p-8 rounded-[2.5rem] border-2 transition-all hover:scale-[1.03] hover:shadow-2xl duration-300 flex flex-col text-left ${getNewsTypeStyles(item.type)}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <i className={`fas ${getNewsIcon(item.type)} text-xl`}></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {item.type === 'emergency' ? 'Авария' : item.type === 'planned' ? 'Плановые' : 'Инфо'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold opacity-60">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h5 className="text-xl font-black mb-4 leading-tight">{item.title}</h5>
                <p className="text-sm font-medium leading-relaxed mb-6 opacity-80 flex-1">{item.content}</p>
                <div className="pt-6 border-t border-current border-opacity-10 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-black">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{item.settlement}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {firstTimePassword && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-key text-3xl"></i>
            </div>
            <h3 className="text-2xl font-black mb-4">Ваш первый вход!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
              Мы создали для вас пароль. <span className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">Обязательно сохраните его</span> для следующих входов:
            </p>
            <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-2xl mb-8 border-2 border-dashed border-primary-50 select-all transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
               <span className="text-3xl font-mono font-black tracking-widest text-primary-600">{firstTimePassword}</span>
            </div>
            <button 
              onClick={onClosePasswordModal}
              className="w-full bg-primary-600 text-white py-4 rounded-xl font-black shadow-lg shadow-primary-500/20 active:scale-95 transition-all hover:bg-primary-700"
            >
              Я записал пароль
            </button>
            <p className="text-xs text-gray-400 mt-4 italic">Пароль можно сменить в настройках профиля.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
