
import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode, User, WaterReading, ServiceApplication, ApplicationStatus, NewsItem, FeedbackItem, Plumber } from './types';
import { INITIAL_USERS, INITIAL_READINGS, ORG_INFO } from './constants';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import UserManual from './pages/UserManual';
import AdminManual from './pages/AdminManual';
import DeveloperPage from './pages/DeveloperPage';
import ChatBot from './components/ChatBot';
import WeatherWidget from './components/WeatherWidget';
import Fireworks from './components/Fireworks';
import TutorialOverlay, { TutorialStep } from './components/TutorialOverlay';
import apiClient from './services/apiClient';

const Snowflakes: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute text-white animate-snowflake"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            fontSize: `${Math.random() * 12 + 12}px`,
            animationDuration: `${Math.random() * 10 + 10}s`,
            animationDelay: `${Math.random() * 5}s`,
            textShadow: '0 0 1px rgba(0,0,0,0.3), 1px 1px 2px rgba(0,0,0,0.1)',
            filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.2))'
          }}
        >
          <i className="fas fa-snowflake"></i>
        </div>
      ))}
      <style>{`
        @keyframes snowflake {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .animate-snowflake {
          animation-name: snowflake;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
      `}</style>
    </div>
  );
};

const Garland: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-4 pointer-events-none z-[60] flex justify-around">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full animate-garland-blink`}
          style={{
            backgroundColor: ['#ff4444', '#44ff44', '#ffff44', '#4444ff', '#ff4444'][i % 5],
            boxShadow: `0 0 12px currentcolor`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes garland-blink {
          0%, 100% { opacity: 0.4; transform: scale(0.8) translateY(-2px); }
          50% { opacity: 1; transform: scale(1.2) translateY(2px); }
        }
        .animate-garland-blink {
          animation: garland-blink 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

const SantaHat: React.FC = () => (
  <div className="absolute -top-5 -left-4 w-12 h-10 pointer-events-none select-none z-10 animate-pulse transition-transform origin-bottom-right rotate-[-15deg]">
    <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-lg">
      <path 
        fill="#EF4444" 
        d="M20,60 Q25,20 60,15 Q85,15 80,45 L75,50 Q60,30 30,55 Z" 
        stroke="#991B1B" 
        strokeWidth="1"
      />
      <rect x="15" y="55" width="65" height="15" rx="7" fill="white" />
      <circle cx="15" cy="62" r="8" fill="white" />
      <circle cx="25" cy="62" r="8" fill="white" />
      <circle cx="35" cy="62" r="8" fill="white" />
      <circle cx="45" cy="62" r="8" fill="white" />
      <circle cx="55" cy="62" r="8" fill="white" />
      <circle cx="65" cy="62" r="8" fill="white" />
      <circle cx="75" cy="62" r="8" fill="white" />
      <circle cx="80" cy="62" r="8" fill="white" />
      <circle cx="85" cy="40" r="10" fill="white" />
      <circle cx="85" cy="40" r="10" fill="url(#fur-pattern)" />
      <defs>
        <radialGradient id="fur-pattern">
          <stop offset="70%" stopColor="white" />
          <stop offset="100%" stopColor="#f3f4f6" />
        </radialGradient>
      </defs>
    </svg>
  </div>
);

const App: React.FC = () => {
  const [showFireworks, setShowFireworks] = useState(false);
  
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('water_users');
      const version = localStorage.getItem('water_users_version');
      if (!version || version !== '2') {
        localStorage.setItem('water_users_version', '2');
        return INITIAL_USERS;
      }
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch (e) {
      console.error('Error parsing users from localStorage', e);
      return INITIAL_USERS;
    }
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem('water_current_view');
    // Всегда начинать с Landing при загрузке, currentUser будет установлен после проверки сессии
    return ViewMode.Landing;
  });
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme_mode');
    return saved ? saved === 'dark' : true;
  });

  const [isNewYearMode, setIsNewYearMode] = useState(() => {
    return false;
  });

  const [isEducationEnabled, setIsEducationEnabled] = useState(() => {
    return localStorage.getItem('is_edu_mode_active') === 'true';
  });

  const [showTutorial, setShowTutorial] = useState(false);
  
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminLogin, setAdminLogin] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [readings, setReadings] = useState<WaterReading[]>(() => {
    const saved = localStorage.getItem('water_readings');
    return saved ? JSON.parse(saved) : INITIAL_READINGS;
  });

  const [applications, setApplications] = useState<ServiceApplication[]>(() => {
    const saved = localStorage.getItem('water_applications');
    return saved ? JSON.parse(saved) : [];
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('water_news');
    return saved ? JSON.parse(saved) : [
      {
        id: 'n1',
        type: 'info',
        title: 'Плановая проверка оборудования',
        content: 'Уважаемые жители, 25 числа будет проводиться плановая проверка узлов учета. Отключения не планируются.',
        settlement: 'г. Питкяранта',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => {
    const saved = localStorage.getItem('water_feedbacks');
    return saved ? JSON.parse(saved) : [];
  });

  const [plumbers, setPlumbers] = useState<Plumber[]>(() => {
    const saved = localStorage.getItem('water_plumbers');
    const version = localStorage.getItem('water_plumbers_version');
    // Если нет версии или версия старая, используем новые данные
    if (!version || version !== '2') {
      // Тестовые сантехники с реальными ФИО
      const defaultPlumbers = [
        {
          id: 'P001',
          fullName: 'Александр Петрович Козлов',
          phone: '+7 921 123-45-67',
          email: 'kozlov.a@example.com',
          specialization: 'verification' as const,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'P002',
          fullName: 'Сергей Валентинович Морозов',
          phone: '+7 921 234-56-78',
          email: 'morozov.s@example.com',
          specialization: 'replacement' as const,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'P003',
          fullName: 'Иван Сергеевич Федоров',
          phone: '+7 921 345-67-89',
          email: 'fedorov.i@example.com',
          specialization: 'general' as const,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'P004',
          fullName: 'Дмитрий Альбертович Лебедев',
          phone: '+7 921 456-78-90',
          email: 'lebedev.d@example.com',
          specialization: 'verification' as const,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'P005',
          fullName: 'Виталий Игоревич Никитин',
          phone: '+7 921 567-89-01',
          email: 'nikitin.v@example.com',
          specialization: 'replacement' as const,
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('water_plumbers_version', '2');
      return defaultPlumbers;
    }
    return saved ? JSON.parse(saved) : [];
  });

  const [firstTimePassword, setFirstTimePassword] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const refreshAllData = useCallback(async () => {
    try {
      const usersData = await apiClient.getUsers();
      setUsers(usersData as User[]);
      localStorage.setItem('water_users', JSON.stringify(usersData));
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
    }
  }, []);

  // Проверка сессии при загрузке приложения
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('water_auth_token');
      const savedUserId = localStorage.getItem('water_auth_user_id');
      
      if (token && savedUserId) {
        try {
          const result = await apiClient.verifyToken();
          if (result.valid && result.user) {
            const user = result.user as User;
            setCurrentUser(user);
            
            // Загружаем актуальные данные пользователя
            if (!user.isAdmin) {
              try {
                const [userReadings, userApplications, userFeedbacks] = await Promise.all([
                  apiClient.getUserReadings(user.id),
                  apiClient.getUserApplications(user.id),
                  apiClient.getUserFeedback(user.id)
                ]);
                
                setReadings(userReadings);
                setApplications(userApplications);
                setFeedbacks(userFeedbacks);
              } catch (dataError) {
                console.error('Ошибка загрузки данных пользователя:', dataError);
              }
            }
            
            // Устанавливаем правильный режим просмотра
            if (user.isAdmin) {
              setViewMode(ViewMode.AdminPanel);
            } else {
              setViewMode(ViewMode.UserDashboard);
            }
          } else {
            // Токен недействителен - очищаем
            apiClient.clearToken();
            localStorage.removeItem('water_auth_user_id');
            setCurrentUser(null);
            setViewMode(ViewMode.Landing);
          }
        } catch (error) {
          console.error('Ошибка проверки сессии:', error);
          // При ошибке очищаем сессию
          apiClient.clearToken();
          localStorage.removeItem('water_auth_user_id');
          setCurrentUser(null);
          setViewMode(ViewMode.Landing);
        }
      } else {
        // Нет токена или ID пользователя
        setViewMode(ViewMode.Landing);
      }
    };
    
    checkSession();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('water_auth_user_id', currentUser.id);
    } else {
      localStorage.removeItem('water_auth_user_id');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('water_current_view', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('water_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('water_readings', JSON.stringify(readings));
  }, [readings]);

  useEffect(() => {
    localStorage.setItem('water_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('water_news', JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem('water_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    localStorage.setItem('water_plumbers', JSON.stringify(plumbers));
  }, [plumbers]);

  useEffect(() => {
    localStorage.setItem('is_new_year', String(isNewYearMode));
  }, [isNewYearMode]);

  useEffect(() => {
    localStorage.setItem('is_edu_mode_active', String(isEducationEnabled));
    // Если глобально включено и пользователь еще не завершил
    if (isEducationEnabled && !localStorage.getItem('tutorial_completed')) {
      setShowTutorial(true);
    } else {
      setShowTutorial(false);
    }
  }, [isEducationEnabled, viewMode]);

  useEffect(() => {
    localStorage.setItem('theme_mode', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = async (accountNumber: string, password?: string) => {
    setLoginError(null);
    try {
      const response = await apiClient.login(accountNumber, password || '');
      apiClient.setToken(response.token);
      
      // Загружаем данные пользователя с сервера
      const user = await apiClient.getUser(response.user.id);
      const fullUser = { ...response.user, ...user, isAdmin: false } as User;
      
      // ВСЕГДА загружаем данные пользователя с сервера для синхронизации между устройствами
      try {
        const [userReadings, userApplications, userFeedbacks] = await Promise.all([
          apiClient.getUserReadings(fullUser.id),
          apiClient.getUserApplications(fullUser.id),
          apiClient.getUserFeedback(fullUser.id)
        ]);
        
        // ПОЛНОСТЬЮ заменяем данные пользователя данными с сервера
        setReadings(userReadings);
        setApplications(userApplications);
        setFeedbacks(userFeedbacks);
        
        console.log('✓ Данные пользователя синхронизированы с сервера:', {
          readings: userReadings.length,
          applications: userApplications.length,
          feedbacks: userFeedbacks.length
        });
      } catch (dataError) {
        console.error('Ошибка загрузки данных пользователя:', dataError);
        // Очищаем локальные данные если не удалось загрузить с сервера
        setReadings([]);
        setApplications([]);
        setFeedbacks([]);
      }
      
      // Если первый вход - показываем модальное окно с временным паролем
      if (response.isFirstLogin && response.tempPassword) {
        setPendingUser(fullUser);
        setFirstTimePassword(response.tempPassword);
      } else {
        setCurrentUser(fullUser);
        setViewMode(ViewMode.UserDashboard);
      }
    } catch (error: any) {
      setLoginError(error.message || 'Ошибка при входе. Проверьте логин и пароль.');
    }
  };

  const closeFirstTimeModal = () => {
    if (pendingUser) {
      setCurrentUser(pendingUser);
      setViewMode(ViewMode.UserDashboard);
      setFirstTimePassword(null);
      setPendingUser(null);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Если логин пустой, используем 'ADMIN' по умолчанию
    const accountNumber = (adminLogin.trim() || 'ADMIN').toUpperCase();
    
    // Проверяем, что пароль введен
    if (!adminPassword.trim()) {
      alert('Введите пароль администратора.');
      return;
    }
    
    try {
      console.log('🔐 Admin auth attempt with accountNumber:', accountNumber);
      const response = await apiClient.login(accountNumber, adminPassword);
      console.log('🔐 Admin login response:', response);
      console.log('🔐 Response user isAdmin:', response.user.isAdmin, 'type:', typeof response.user.isAdmin);
      
      const isAdminFromServer = !!response.user.isAdmin;
      console.log('🔐 isAdmin after conversion:', isAdminFromServer);
      
      if (!isAdminFromServer) {
        console.warn('🔐 User is not an admin, access denied');
        alert('Этот пользователь не имеет прав администратора.');
        return;
      }
      
      apiClient.setToken(response.token);
      
      const adminUser = { 
        ...response.user, 
        isAdmin: true
      } as User;
      
      console.log('🔐 Setting currentUser with isAdmin:', adminUser.isAdmin);
      console.log('🔐 Full admin user object:', adminUser);
      
      setCurrentUser(adminUser);
      console.log('🔐 About to set viewMode to AdminPanel');
      setViewMode(ViewMode.AdminPanel);
      console.log('🔐 ViewMode set to:', ViewMode.AdminPanel);
      
      setIsAdminModalOpen(false);
      setAdminLogin('');
      setAdminPassword('');
      setShowAdminPassword(false);
      
      // Загружаем данные после авторизации
      try {
        const usersData = await apiClient.getUsers();
        setUsers(usersData as User[]);
        console.log('✓ Данные загружены:', usersData.length);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        setUsers(INITIAL_USERS);
      }
    } catch (error) {
      alert('Неверный логин или пароль.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewMode(ViewMode.Landing);
    setFirstTimePassword(null);
    setLoginError(null);
    apiClient.clearToken();
    localStorage.removeItem('water_auth_user_id');
  };

  const addReading = async (reading: WaterReading) => {
    try {
      // Сохраняем на сервер
      const response = await apiClient.createReading({
        userId: reading.userId,
        coldWater: reading.coldWater,
        hotWater: reading.hotWater,
        coldWater2: reading.coldWater2,
        hotWater2: reading.hotWater2
      });
      
      // Обновляем локальное состояние с ID от сервера
      const serverReading = { ...reading, id: response.id };
      setReadings(prev => [...prev, serverReading]);
      console.log('✅ Показания сохранены на сервер и добавлены локально');
      return serverReading;
    } catch (error) {
      console.error('❌ Ошибка сохранения показаний на сервер:', error);
      // Добавляем локально даже если сервер недоступен
      setReadings(prev => [...prev, reading]);
      return reading;
    }
  };

  const handleLogoClick = () => {
    if (!currentUser) {
      setViewMode(ViewMode.Landing);
    } else {
      setViewMode(currentUser.isAdmin ? ViewMode.AdminPanel : ViewMode.UserDashboard);
    }
  };

  const addApplication = async (app: ServiceApplication) => {
    try {
      // Сохраняем на сервер
      const response = await apiClient.createApplication({
        userId: app.userId,
        serviceType: app.serviceType,
        meterType: app.meterType,
        deliveryAddress: app.deliveryAddress,
        deliveryVolume: app.deliveryVolume,
        contactPhone: app.contactPhone,
        preferredDateTime: app.preferredDateTime,
        status: app.status
      });
      
      // Обновляем локальное состояние с ID от сервера
      const serverApp = { ...app, id: response.id };
      setApplications(prev => [serverApp, ...prev]);
      console.log('✅ Заявка сохранена на сервер и добавлена локально');
    } catch (error) {
      console.error('❌ Ошибка сохранения заявки на сервер:', error);
      // Добавляем локально даже если сервер недоступен
      setApplications(prev => [app, ...prev]);
    }
  };

  const addFeedback = async (feedback: FeedbackItem) => {
    try {
      // Сохраняем на сервер
      const response = await apiClient.createFeedback({
        userId: feedback.userId,
        text: feedback.text,
        isRead: feedback.isRead,
        isUserRead: feedback.isUserRead
      });
      
      // Обновляем локальное состояние с ID от сервера
      const serverFeedback = { ...feedback, id: response.id };
      setFeedbacks(prev => [serverFeedback, ...prev]);
      console.log('✅ Сообщение сохранено на сервер и добавлено локально');
    } catch (error) {
      console.error('❌ Ошибка сохранения сообщения на сервер:', error);
      // Добавляем локально даже если сервер недоступен
      setFeedbacks(prev => [feedback, ...prev]);
    }
  };

  const updateApplicationStatus = (appId: string, status: ApplicationStatus) => {
    setApplications(prev => prev.map(app => 
      app.id === appId ? { ...app, status, updatedAt: new Date().toISOString() } : app
    ));
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const tutorialSteps: TutorialStep[] = [
    { 
      targetId: 'tutorial-login', 
      title: 'Личный кабинет', 
      content: 'Чтобы начать, введите номер вашего лицевого счета. При первом входе система автоматически сгенерирует ваш пароль.',
      view: ViewMode.Landing
    },
    { 
      targetId: 'tutorial-weather', 
      title: 'Погода в округе', 
      content: 'Здесь отображается актуальный прогноз погоды для вашего населенного пункта. Константин также может дать совет по одежде.',
      view: ViewMode.Landing
    },
    { 
      targetId: 'tutorial-news', 
      title: 'Важные новости', 
      content: 'Не пропускайте сообщения об авариях и плановых работах в Питкярантском округе.',
      view: ViewMode.Landing
    },
    { 
      targetId: 'tutorial-readings', 
      title: 'Передача данных', 
      content: 'Введите текущие значения счетчиков ХВС и ГВС. Система мгновенно рассчитает стоимость и подготовит квитанцию.',
      view: ViewMode.UserDashboard
    },
    { 
      targetId: 'tutorial-services', 
      title: 'Заказ услуг', 
      content: 'Оформляйте заявки на поверку счетчиков или подвоз питьевой воды прямо из личного кабинета.',
      view: ViewMode.UserDashboard
    },
    { 
      targetId: 'chatbot-trigger', 
      title: 'Помощник Константин', 
      content: 'Наш ИИ-помощник ответит на любой ваш вопрос о тарифах и услугах в любое время суток.',
      view: ViewMode.UserDashboard
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      {isNewYearMode && viewMode !== ViewMode.AdminPanel && viewMode !== ViewMode.AdminManual && (
        <>
          <Garland />
          <Snowflakes />
        </>
      )}

      {showFireworks && <Fireworks onComplete={() => setShowFireworks(false)} />}

      {showTutorial && (
        <TutorialOverlay 
          steps={tutorialSteps} 
          currentView={viewMode}
          onComplete={() => {
            setShowTutorial(false);
            localStorage.setItem('tutorial_completed', 'true');
          }} 
        />
      )}

      <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 cursor-pointer group" onClick={handleLogoClick}>
              <div className="relative w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform shrink-0">
                <i className="fas fa-faucet-drip text-2xl"></i>
                {isNewYearMode && viewMode !== ViewMode.AdminPanel && <SantaHat />}
              </div>
              <div className="hidden sm:block text-left">
                <h1 className="text-xl font-black leading-tight tracking-tight uppercase text-gray-900 dark:text-white">Хозуправление</h1>
                <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">Питкяранта • Карелия</p>
              </div>
            </div>

            {currentUser && (
              <div 
                onClick={handleLogoClick}
                className="flex items-center space-x-3 pl-6 border-l border-gray-100 dark:border-gray-800 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-xs font-black text-white ring-4 ring-primary-50 dark:ring-primary-900/20 overflow-hidden group-hover:ring-primary-100 dark:group-hover:ring-primary-900/40 transition-all">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-contain bg-white" />
                  ) : getInitials(currentUser.fullName)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-black truncate max-w-[180px] group-hover:text-primary-600 transition-colors text-gray-900 dark:text-white">
                    {currentUser.isLegalEntity ? currentUser.companyName : currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    {currentUser.isAdmin ? 'Сотрудник' : `Л/С: ${currentUser.accountNumber}`}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-6">
            <div id="tutorial-weather" className="flex items-center">
              <WeatherWidget user={currentUser || undefined} />
            </div>
            
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500 dark:text-gray-400"
              title={darkMode ? "Переключить на светлую тему" : "Переключить на темную тему"}
            >
              <i className={`fas ${darkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-blue-500'}`}></i>
            </button>
            
            {currentUser ? (
              <button 
                onClick={handleLogout}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                title="Выйти"
              >
                <i className="fas fa-power-off"></i>
              </button>
            ) : (
               <div className="hidden md:flex items-center space-x-2 text-sm font-bold text-gray-500">
                 <i className="fas fa-headset text-primary-600"></i>
                 <span>{ORG_INFO.dispatchPhone}</span>
               </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {viewMode === ViewMode.Landing && (
          <LandingPage 
            onLogin={handleLogin} 
            firstTimePassword={firstTimePassword} 
            onClosePasswordModal={closeFirstTimeModal} 
            loginError={loginError}
            isNewYear={isNewYearMode}
            news={news}
            onTriggerFireworks={() => setShowFireworks(true)}
          />
        )}
        {viewMode === ViewMode.UserDashboard && currentUser && (
          <Dashboard 
            user={currentUser} 
            readings={readings} 
            applications={applications.filter(a => a.userId === currentUser.id)}
            feedbacks={feedbacks}
            onAddReading={addReading}
            onAddApplication={addApplication}
            onAddFeedback={addFeedback}
            onUpdateFeedback={setFeedbacks}
            onUpdateProfile={(updatedUser) => {
              setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
              setCurrentUser(updatedUser);
            }}
          />
        )}
        {viewMode === ViewMode.AdminPanel && currentUser && currentUser.isAdmin && (
          <AdminPanel 
            users={users} 
            readings={readings}
            applications={applications}
            news={news}
            feedbacks={feedbacks}
            plumbers={plumbers}
            onUpdateUsers={setUsers}
            onUpdateReadings={setReadings}
            onUpdateApplicationStatus={updateApplicationStatus}
            onUpdateApplications={setApplications}
            onUpdateNews={setNews}
            onUpdateFeedbacks={setFeedbacks}
            onUpdatePlumbers={setPlumbers}
            isNewYear={isNewYearMode}
            onToggleNewYear={() => setIsNewYearMode(!isNewYearMode)}
            isEducationEnabled={isEducationEnabled}
            onToggleEducation={() => setIsEducationEnabled(!isEducationEnabled)}
            onRefreshData={refreshAllData}
            onViewManual={() => setViewMode(ViewMode.AdminManual)}
          />
        )}
        {viewMode === ViewMode.AdminPanel && currentUser && !currentUser.isAdmin && (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-3xl p-12">
              <i className="fas fa-lock text-5xl text-red-500 mb-6 block"></i>
              <h2 className="text-3xl font-black text-red-700 dark:text-red-400 mb-4">Доступ запрещен</h2>
              <p className="text-red-600 dark:text-red-300 text-lg mb-8">У вас нет прав администратора для доступа к этой панели.</p>
              <button 
                onClick={() => setViewMode(ViewMode.Landing)}
                className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all"
              >
                Вернуться на главную
              </button>
            </div>
          </div>
        )}
        {viewMode === ViewMode.PrivacyPolicy && <PrivacyPolicy onBack={handleLogoClick} />}
        {viewMode === ViewMode.TermsOfUse && <TermsOfUse onBack={handleLogoClick} />}
        {viewMode === ViewMode.UserManual && <UserManual onBack={handleLogoClick} />}
        {viewMode === ViewMode.AdminManual && <AdminManual onBack={() => setViewMode(ViewMode.AdminPanel)} />}
        {viewMode === ViewMode.DeveloperPage && <DeveloperPage />}
      </main>

      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
            <div className="col-span-1 md:col-span-1 space-y-6">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-gray-900 dark:bg-primary-600 rounded-xl flex items-center justify-center text-white">
                   <i className="fas fa-faucet-drip"></i>
                 </div>
                 <h3 className="text-lg font-black uppercase tracking-tighter leading-none text-gray-900 dark:text-white">Хозуправление<br/><span className="text-xs text-primary-600">Питкяранта</span></h3>
               </div>
               <p className="text-sm text-gray-500 leading-relaxed">
                 Муниципальное казенное учреждение Питкярантского муниципального округа "Хозяйственное управление".
               </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Контакты</h4>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 group">
                   <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-primary-600 transition-colors">
                     <i className="fas fa-envelope text-xs"></i>
                   </div>
                   <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{ORG_INFO.email}</span>
                </li>
                <li className="flex items-start space-x-3 group">
                   <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-primary-600 transition-colors">
                     <i className="fas fa-phone-alt text-xs"></i>
                   </div>
                   <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{ORG_INFO.phone}</span>
                </li>
                <li className="flex items-start space-x-3 group">
                   <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-500">
                     <i className="fas fa-life-ring text-xs"></i>
                   </div>
                   <div className="text-sm">
                      <div className="text-red-600 font-bold leading-none mb-1 text-gray-900 dark:text-white">Диспетчерская</div>
                      <div className="text-gray-600 dark:text-gray-400 font-medium">{ORG_INFO.dispatchPhone}</div>
                   </div>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Локация</h4>
              <div className="flex items-start space-x-3 p-3 -m-3 rounded-2xl">
                 <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                   <i className="fas fa-map-marker-alt text-xs"></i>
                 </div>
                 <div>
                   <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                      {ORG_INFO.address}
                   </p>
                 </div>
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-11">
                Пн-Пт: 08:30 – 17:30
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Система</h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-loose">
                Сроки подачи: <span className="text-primary-600">{ORG_INFO.readingPeriod}</span>
              </p>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => setViewMode(ViewMode.UserManual)}
                  className="w-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-100 transition-all border border-primary-100 dark:border-primary-800"
                >
                  <i className="fas fa-book-open mr-2"></i> Инструкция пользователя
                </button>
                <button 
                  onClick={() => setIsAdminModalOpen(true)}
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                >
                  <i className="fas fa-lock mr-2"></i> Вход для сотрудников
                </button>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                &copy; {new Date().getFullYear()} {ORG_INFO.name}
              </p>
              <button 
                onClick={() => setViewMode(ViewMode.DeveloperPage)}
                className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2 hover:text-primary-600 transition-colors text-left"
              >
                Разработка и поддержка: Романов Максим
              </button>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-2 opacity-60">
                All rights reserved. {new Date().getFullYear()} МКУ ПМО Хозяйственное управление - Питкяранта.
              </p>
            </div>
            <div className="flex space-x-8">
               <button 
                onClick={() => setViewMode(ViewMode.PrivacyPolicy)}
                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary-600 cursor-pointer transition-colors"
               >
                 Политика конфиденциальности
               </button>
               <button 
                onClick={() => setViewMode(ViewMode.TermsOfUse)}
                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary-600 cursor-pointer transition-colors"
               >
                 Условия использования
               </button>
            </div>
          </div>
        </div>
      </footer>

      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 md:p-14 w-full max-w-md shadow-2xl relative border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setIsAdminModalOpen(false)} 
              className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all hover:scale-110 active:scale-90"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
            
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-[2rem] flex items-center justify-center text-primary-600 dark:text-primary-400 text-3xl mx-auto mb-6 shadow-inner border border-primary-50 dark:border-primary-800/50">
                <i className="fas fa-user-shield"></i>
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Сотрудникам</h3>
              <p className="text-sm text-gray-500 font-medium mt-2">Авторизация в панели управления</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Логин можно оставить пустым</p>
            </div>

            <form onSubmit={handleAdminAuth} className="space-y-8 text-left">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Логин доступа</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-gray-400 group-focus-within:text-primary-600 transition-colors">
                      <i className="fas fa-at"></i>
                    </span>
                    <input 
                      type="text" 
                      value={adminLogin}
                      onChange={(e) => setAdminLogin(e.target.value)}
                      placeholder="admin (или оставьте пустым)"
                      className="w-full max-w-md pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border-2 border-transparent focus:border-primary-500 rounded-2xl font-bold transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Пароль</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-gray-400 group-focus-within:text-primary-600 transition-colors">
                      <i className="fas fa-fingerprint"></i>
                    </span>
                    <input 
                      type={showAdminPassword ? "text" : "password"} 
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full max-w-md pl-12 pr-14 py-4 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border-2 border-transparent focus:border-primary-500 rounded-2xl font-bold transition-all outline-none"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <i className={`fas ${showAdminPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                    </button>
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-primary-500 transition-all shadow-2xl shadow-primary-500/25 active:scale-[0.98] flex items-center justify-center space-x-3"
              >
                <span>Подтвердить вход</span>
                <i className="fas fa-chevron-right text-sm"></i>
              </button>
            </form>
          </div>
        </div>
      )}

      <ChatBot />
    </div>
  );
};

export default App;
