
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, WaterReading, ServiceApplication, ServiceType, MeterType, ApplicationStatus, FeedbackItem, BillingRecord } from '../types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ORG_INFO, AVATAR_OPTIONS, THEME_OPTIONS, PITKYARANTA_SETTLEMENTS, WATER_FACTS } from '../constants';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import apiClient from '../services/apiClient';

interface DashboardProps {
  user: User;
  readings: WaterReading[];
  applications: ServiceApplication[];
  feedbacks?: FeedbackItem[];
  onAddReading: (reading: WaterReading) => void;
  onAddApplication: (app: ServiceApplication) => void;
  onAddFeedback: (feedback: FeedbackItem) => void;
  onUpdateFeedback?: (feedbacks: FeedbackItem[]) => void;
  onUpdateProfile: (user: User) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a]/95 backdrop-blur-md border border-gray-700 p-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-800 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-[10px] font-black text-gray-300 uppercase">{entry.name === 'cold' ? 'ХВС' : 'ГВС'}</span>
              </div>
              <p className="text-sm font-black text-white">
                {entry.value.toFixed(2)} <span className="text-[10px] opacity-60">м³</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ 
  user, readings, applications, feedbacks = [], 
  onAddReading, onAddApplication, onAddFeedback, onUpdateFeedback, onUpdateProfile 
}) => {
  const [activeTab, setActiveTab] = useState<'readings' | 'profile' | 'history' | 'applications' | 'feedback'>('readings');
  const [coldVal, setColdVal] = useState('');
  const [hotVal, setHotVal] = useState('');
  const [coldVal2, setColdVal2] = useState('');
  const [hotVal2, setHotVal2] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [lastSubmittedReading, setLastSubmittedReading] = useState<WaterReading | null>(null);
  
  const [factIndex, setFactIndex] = useState(Math.floor(Math.random() * WATER_FACTS.length));
  const [factAnimate, setFactAnimate] = useState(true);

  const receiptTemplateRef = useRef<HTMLDivElement>(null);
  const deliveryBillTemplateRef = useRef<HTMLDivElement>(null);

  const [bills, setBills] = useState<BillingRecord[]>(() => {
    const saved = localStorage.getItem(`water_bills_${user.id}`);
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [paymentModalData, setPaymentModalData] = useState<BillingRecord | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  const [appType, setAppType] = useState<ServiceType>('verification');
  const [appMeterType, setAppMeterType] = useState<MeterType>('both');
  const [deliveryAddress, setDeliveryAddress] = useState(user.address || '');
  const [deliveryVolume, setDeliveryVolume] = useState('1');
  const [appPhone, setAppPhone] = useState(user.phone || '');
  const [appDateTime, setAppDateTime] = useState('');
  const [appTimeError, setAppTimeError] = useState<string | null>(null);
  const [isAppSubmitting, setIsAppSubmitting] = useState(false);
  const [lastSubmittedApp, setLastSubmittedApp] = useState<ServiceApplication | null>(null);
  const [isAppSuccessModalOpen, setIsAppSuccessModalOpen] = useState(false);

  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [isFeedbackSuccess, setIsFeedbackSuccess] = useState(false);

  const [profileForm, setProfileForm] = useState(user);
  const [confirmPassword, setConfirmPassword] = useState(user.password || '');
  const [isProfileUpdateSuccess, setIsProfileUpdateSuccess] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Синхронизация profileForm с изменениями user prop (при импорте новых пользователей или обновлении данных)
  useEffect(() => {
    setProfileForm(user);
    setConfirmPassword(user.password || '');
    setDeliveryAddress(user.address || '');
  }, [user]);

  useEffect(() => {
    localStorage.setItem(`water_bills_${user.id}`, JSON.stringify(bills));
  }, [bills, user.id]);

  // Сброс уведомлений при открытии вкладки обратной связи
  useEffect(() => {
    if (activeTab === 'feedback' && onUpdateFeedback) {
      const userFeedbacks = feedbacks.filter(f => f.userId === user.id && f.adminReply && !f.isUserRead);
      if (userFeedbacks.length > 0) {
        onUpdateFeedback(feedbacks.map(f => 
          (f.userId === user.id && f.adminReply && !f.isUserRead) ? { ...f, isUserRead: true } : f
        ));
      }
    }
  }, [activeTab, feedbacks, user.id]);

  // Валидация даты и времени в реальном времени
  useEffect(() => {
    if (!appDateTime) {
      setAppTimeError(null);
      return;
    }
    const selectedDate = new Date(appDateTime);
    const day = selectedDate.getDay(); 
    const hours = selectedDate.getHours();
    const minutes = selectedDate.getMinutes();
    const timeInMinutes = hours * 60 + minutes;

    if (day === 0 || day === 6) {
      setAppTimeError("Выбран выходной день. Услуги оказываются в рабочие дни с понедельника по пятницу.");
    } else if (timeInMinutes < 8 * 60 + 30 || timeInMinutes > 17 * 60 + 30) {
      setAppTimeError("Выбрано нерабочее время. Услуги оказываются в рабочее время с 08:30 до 17:30.");
    } else {
      setAppTimeError(null);
    }
  }, [appDateTime]);

  const themeClasses: Record<string, string> = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    purple: 'from-purple-600 to-purple-700',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-600 to-indigo-700',
  };

  const accentBgClasses: Record<string, string> = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-600',
  };

  const textAccentClasses: Record<string, string> = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    indigo: 'text-indigo-500',
  };

  const currentThemeGradient = themeClasses[profileForm.themeColor || 'blue'];
  const currentAccentBg = accentBgClasses[profileForm.themeColor || 'blue'];
  const currentTextAccent = textAccentClasses[profileForm.themeColor || 'blue'];

  const userReadings = useMemo(() => 
    readings.filter(r => r.userId === user.id)
      .sort((a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime())
  , [readings, user.id]);

  const lastReading = useMemo(() => userReadings[userReadings.length - 1], [userReadings]);

  const averageMonthlyConsumption = useMemo(() => {
    if (userReadings.length < 2) return null;
    
    let totalCold = 0;
    let totalHot = 0;
    let intervalsCount = userReadings.length - 1;

    for (let i = 1; i < userReadings.length; i++) {
      totalCold += Math.max(0, userReadings[i].coldWater - userReadings[i-1].coldWater);
      totalHot += Math.max(0, userReadings[i].hotWater - userReadings[i-1].hotWater);
    }

    const avgCold = totalCold / intervalsCount;
    const avgHot = totalHot / intervalsCount;
    const avgVol = avgCold + avgHot;
    
    const estCost = (avgCold * ORG_INFO.tariffs.cold) + 
                    (avgHot * ORG_INFO.tariffs.hot) + 
                    (avgVol * ORG_INFO.tariffs.disposal);

    return { avgVol, avgCold, avgHot, estCost };
  }, [userReadings]);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 1; i < userReadings.length; i++) {
      const curr = userReadings[i];
      const prev = userReadings[i-1];
      data.push({
        date: new Date(curr.submissionDate).toLocaleDateString('ru-RU', { month: 'short' }),
        cold: Math.max(0, curr.coldWater - prev.coldWater),
        hot: Math.max(0, curr.hotWater - prev.hotWater),
      });
    }
    return data.slice(-6);
  }, [userReadings]);

  const userFeedbacks = useMemo(() => feedbacks.filter(f => f.userId === user.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [feedbacks, user.id]);
  const unreadRepliesCount = useMemo(() => userFeedbacks.filter(f => f.adminReply && !f.isUserRead).length, [userFeedbacks]);

  const getReadingCalculation = (reading: WaterReading) => {
    const allUserReadings = readings.filter(r => r.userId === user.id)
      .sort((a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime());
    
    const idx = allUserReadings.findIndex(r => r.id === reading.id);
    const prevReading = idx > 0 ? allUserReadings[idx - 1] : null;

    const coldPrev = prevReading ? prevReading.coldWater : 0;
    const hotPrev = prevReading ? prevReading.hotWater : 0;
    const coldPrev2 = prevReading ? (prevReading.coldWater2 || 0) : 0;
    const hotPrev2 = prevReading ? (prevReading.hotWater2 || 0) : 0;
    
    const coldDiff = Math.max(0, reading.coldWater - coldPrev);
    const hotDiff = Math.max(0, reading.hotWater - hotPrev);
    const coldDiff2 = user.hasDualMeters ? Math.max(0, (reading.coldWater2 || 0) - coldPrev2) : 0;
    const hotDiff2 = user.hasDualMeters ? Math.max(0, (reading.hotWater2 || 0) - hotPrev2) : 0;
    
    const totalVol = coldDiff + hotDiff + coldDiff2 + hotDiff2;

    const coldCost = (coldDiff + coldDiff2) * ORG_INFO.tariffs.cold;
    const hotCost = (hotDiff + hotDiff2) * ORG_INFO.tariffs.hot;
    const disposalCost = totalVol * ORG_INFO.tariffs.disposal;
    const total = coldCost + hotCost + disposalCost;

    return { 
      coldPrev, hotPrev, coldPrev2, hotPrev2,
      coldDiff, hotDiff, coldDiff2, hotDiff2,
      totalVol, coldCost, hotCost, disposalCost, total 
    };
  };

  const handleDownloadPdf = async (type: 'reading' | 'delivery' = 'reading', entity?: any) => {
    const ref = type === 'reading' ? receiptTemplateRef : deliveryBillTemplateRef;
    const target = entity || (type === 'reading' ? lastSubmittedReading : lastSubmittedApp);
    
    if (!target || !ref.current) return;
    setIsGeneratingPdf(true);
    try {
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 400));
      const canvas = await html2canvas(ref.current, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('p', 'mm', 'a4', true);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save(`${type === 'reading' ? 'Квитанция' : 'Счет'}_${user.accountNumber}_${new Date().toLocaleDateString()}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Ошибка при создании PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Fixed typo: iNaN replaced with isNaN
  const handleSubmitReading = async (e: React.FormEvent) => {
    e.preventDefault();
    const cold = parseFloat(coldVal);
    const hot = parseFloat(hotVal);
    const cold2 = user.hasDualMeters ? parseFloat(coldVal2) : NaN;
    const hot2 = user.hasDualMeters ? parseFloat(hotVal2) : NaN;
    
    if (isNaN(cold) || isNaN(hot)) return;
    if (user.hasDualMeters && (isNaN(cold2) || isNaN(hot2))) return;

    if (lastReading && (cold < lastReading.coldWater || hot < lastReading.hotWater)) {
      alert('Показания не могут быть меньше предыдущих.');
      return;
    }
    
    if (user.hasDualMeters && lastReading && (cold2 < (lastReading.coldWater2 || 0) || hot2 < (lastReading.hotWater2 || 0))) {
      alert('Показания второго счетчика не могут быть меньше предыдущих.');
      return;
    }

    try {
      const readingData = {
        userId: user.id,
        coldWater: cold,
        hotWater: hot,
        coldWater2: user.hasDualMeters ? cold2 : null,
        hotWater2: user.hasDualMeters ? hot2 : null
      };

      const response = await apiClient.createReading(readingData);

      const newReading: WaterReading = { 
        id: response.id, 
        userId: user.id, 
        coldWater: cold, 
        hotWater: hot,
        coldWater2: user.hasDualMeters ? cold2 : undefined,
        hotWater2: user.hasDualMeters ? hot2 : undefined,
        submissionDate: new Date().toISOString() 
      };

      onAddReading(newReading);
      setLastSubmittedReading(newReading);
      
      const calc = getReadingCalculation(newReading);
      const newBill: BillingRecord = {
        id: 'B' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        userId: user.id,
        amount: parseFloat(calc.total.toFixed(2)),
        description: `Водоснабжение (показания от ${new Date().toLocaleDateString('ru-RU')})`,
        status: 'unpaid',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      setBills(prev => [newBill, ...prev]);
      setColdVal(''); setHotVal(''); setColdVal2(''); setHotVal2('');
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      alert('Ошибка при отправке показаний: ' + error.message);
    }
  };

  const handleAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appDateTime || appTimeError) return;

    setIsAppSubmitting(true);
    try {
      const appData = {
        userId: user.id,
        serviceType: appType,
        meterType: appType !== 'water_delivery' ? appMeterType : null,
        deliveryAddress: appType === 'water_delivery' ? deliveryAddress : null,
        deliveryVolume: appType === 'water_delivery' ? parseFloat(deliveryVolume) : null,
        contactPhone: appPhone,
        preferredDateTime: appDateTime,
        status: 'pending'
      };

      const response = await apiClient.createApplication(appData);

      const newApp: ServiceApplication = {
        id: response.id,
        userId: user.id,
        serviceType: appType,
        meterType: appType !== 'water_delivery' ? appMeterType : undefined,
        deliveryAddress: appType === 'water_delivery' ? deliveryAddress : undefined,
        deliveryVolume: appType === 'water_delivery' ? parseFloat(deliveryVolume) : undefined,
        contactPhone: appPhone,
        preferredDateTime: appDateTime,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      onAddApplication(newApp);
      setLastSubmittedApp(newApp);
      setAppDateTime('');
      setIsAppSuccessModalOpen(true);
    } catch (error: any) {
      alert('Ошибка при отправке заявки: ' + error.message);
    } finally {
      setIsAppSubmitting(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileForm.password && profileForm.password !== confirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }
    
    try {
      const updateData: any = {
        fullName: profileForm.fullName,
        address: profileForm.address,
        settlement: profileForm.settlement,
        phone: profileForm.phone,
        email: profileForm.email,
        avatarUrl: profileForm.avatarUrl,
        themeColor: profileForm.themeColor,
        weatherProvider: profileForm.weatherProvider,
        hasDualMeters: profileForm.hasDualMeters,
      };
      
      // Если пароль изменен, добавляем его в запрос
      if (profileForm.password && profileForm.password !== user.password) {
        updateData.newPassword = profileForm.password;
      }
      
      // Отправляем данные на сервер
      await apiClient.updateUser(user.id, updateData);
      
      // Обновляем локальное состояние
      onUpdateProfile(profileForm);
      setIsProfileUpdateSuccess(true);
      setShowSaveNotification(true);
      setTimeout(() => {
        setIsProfileUpdateSuccess(false);
        setShowSaveNotification(false);
      }, 4000);
    } catch (error: any) {
      alert('Ошибка при сохранении профиля: ' + error.message);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: 'bg-gray-200', width: '0%', text: '' };
    if (pwd.length < 6) return { label: 'Слабый', color: 'bg-red-500', width: '33%', text: 'text-red-500' };
    if (pwd.length < 10 || !/[0-9]/.test(pwd) || !/[a-zA-Z]/.test(pwd)) return { label: 'Средний', color: 'bg-yellow-500', width: '66%', text: 'text-yellow-500' };
    return { label: 'Сильный', color: 'bg-green-500', width: '100%', text: 'text-green-500' };
  };

  const pwdStrength = getPasswordStrength(profileForm.password || '');

  const handleNextFact = () => {
    setFactAnimate(false);
    setTimeout(() => {
      setFactIndex((prev) => (prev + 1) % WATER_FACTS.length);
      setFactAnimate(true);
    }, 300);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setIsFeedbackSubmitting(true);
    setTimeout(() => {
      const newFeedback: FeedbackItem = {
        id: 'F' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        userId: user.id,
        text: feedbackText,
        isRead: false,
        isUserRead: true, // Сообщение от пользователя - им же прочитано
        createdAt: new Date().toISOString()
      };
      onAddFeedback(newFeedback);
      setFeedbackText('');
      setIsFeedbackSubmitting(false);
      setIsFeedbackSuccess(true);
      setTimeout(() => setIsFeedbackSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative text-left">
      {showSaveNotification && (
        <div className="fixed top-24 right-8 z-[500] animate-in slide-in-from-right duration-500">
          <div className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
            <i className="fas fa-check-circle text-xl"></i>
            <span className="font-black uppercase text-xs tracking-widest">Данные личного кабинета успешно сохранены</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#1e293b] rounded-[2.5rem] shadow-xl border border-gray-700/50 overflow-hidden relative transition-all">
            <div className={`p-8 bg-gradient-to-br ${currentThemeGradient} text-white flex flex-col items-center relative z-20`}>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 text-3xl font-bold border-4 border-white/30 overflow-hidden shadow-inner">
                {profileForm.avatarUrl ? <img src={profileForm.avatarUrl} className="w-full h-full object-contain bg-white transition-all duration-300" /> : <i className="fas fa-user text-primary-600"></i>}
              </div>
              <h2 className="font-bold text-center leading-tight text-lg">{profileForm.fullName || 'Пользователь'}</h2>
              <p className="text-sm opacity-80 mt-1 uppercase tracking-widest font-black text-[10px]">Л/С: {user.accountNumber}</p>
            </div>
            <nav className="p-3 relative z-20">
              {[
                { id: 'readings', icon: 'fa-edit', label: 'Передать данные' },
                { id: 'applications', icon: 'fa-truck-droplet', label: 'Мои услуги' },
                { id: 'history', icon: 'fa-chart-line', label: 'Статистика' },
                { id: 'profile', icon: 'fa-user-cog', label: 'Мой профиль' },
                { id: 'feedback', icon: 'fa-comment-dots', label: 'Обратная связь', badge: unreadRepliesCount }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-5 py-4 rounded-[1.5rem] flex items-center justify-between transition-all duration-300 ${activeTab === tab.id ? 'bg-[#0f172a] ' + currentTextAccent + ' translate-x-1 shadow-lg' : 'text-gray-400 hover:bg-[#0f172a]/50 hover:translate-x-1 font-bold'}`}
                >
                  <div className="flex items-center space-x-4">
                    <i className={`fas ${tab.icon} w-6 text-center text-lg`}></i>
                    <span className="font-bold text-sm">{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="bg-[#1e293b] rounded-[2rem] p-6 border border-gray-700/50 shadow-lg text-left">
             <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">А вы знали?</span>
               <button onClick={handleNextFact} className="text-gray-500 hover:text-white"><i className="fas fa-redo text-[10px]"></i></button>
             </div>
             <p className={`text-xs font-bold text-gray-300 leading-relaxed transition-all duration-300 ${factAnimate ? 'opacity-100' : 'opacity-0'}`}>{WATER_FACTS[factIndex]}</p>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'readings' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-left">
              <div id="tutorial-readings" className="bg-[#1e293b] p-8 md:p-10 rounded-[3rem] shadow-xl border border-gray-700/50">
                <h3 className="text-2xl font-black flex items-center gap-4 text-white mb-8">
                  <i className={`fas fa-faucet-drip ` + currentTextAccent}></i> Ввод показаний
                </h3>
                <form onSubmit={handleSubmitReading} className={`grid gap-8 ${user.hasDualMeters ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">Холодная вода №1 (м³)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={coldVal} 
                      onChange={e => setColdVal(e.target.value)} 
                      placeholder={lastReading ? lastReading.coldWater.toFixed(2) : "0.00"} 
                      className="w-full px-6 py-4 bg-[#0f172a] border-2 border-transparent focus:border-blue-500 rounded-2xl font-black text-2xl outline-none text-white transition-all shadow-inner placeholder:text-gray-600" 
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase text-red-400 tracking-[0.2em]">Горячая вода №1 (м³)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={hotVal} 
                      onChange={e => setHotVal(e.target.value)} 
                      placeholder={lastReading ? lastReading.hotWater.toFixed(2) : "0.00"} 
                      className="w-full px-6 py-4 bg-[#0f172a] border-2 border-transparent focus:border-red-500 rounded-2xl font-black text-2xl outline-none text-white transition-all shadow-inner placeholder:text-gray-600" 
                      required 
                    />
                  </div>
                  {user.hasDualMeters && (
                    <>
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black uppercase text-blue-300 tracking-[0.2em]">Холодная вода №2 (м³)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={coldVal2} 
                          onChange={e => setColdVal2(e.target.value)} 
                          placeholder={lastReading?.coldWater2 ? lastReading.coldWater2.toFixed(2) : "0.00"} 
                          className="w-full px-6 py-4 bg-[#0f172a] border-2 border-transparent focus:border-blue-300 rounded-2xl font-black text-2xl outline-none text-white transition-all shadow-inner placeholder:text-gray-600" 
                          required 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black uppercase text-red-300 tracking-[0.2em]">Горячая вода №2 (м³)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={hotVal2} 
                          onChange={e => setHotVal2(e.target.value)} 
                          placeholder={lastReading?.hotWater2 ? lastReading.hotWater2.toFixed(2) : "0.00"} 
                          className="w-full px-6 py-4 bg-[#0f172a] border-2 border-transparent focus:border-red-300 rounded-2xl font-black text-2xl outline-none text-white transition-all shadow-inner placeholder:text-gray-600" 
                          required 
                        />
                      </div>
                    </>
                  )}
                  <button type="submit" className={`${user.hasDualMeters ? 'lg:col-span-4' : 'md:col-span-2'} px-10 py-5 ${currentAccentBg} text-white rounded-2xl font-black text-lg shadow-xl hover:brightness-110 active:scale-[0.98] transition-all`}>
                    Отправить данные
                  </button>
                </form>
              </div>

              {averageMonthlyConsumption && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
                   <div className="md:col-span-2 bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                      <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                        <i className="fas fa-brain text-[180px] text-indigo-400"></i>
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                             <i className="fas fa-robot"></i>
                           </div>
                           <h4 className="text-sm font-black text-indigo-300 uppercase tracking-widest">Умный прогноз на следующий месяц</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8 mb-6">
                           <div className="space-y-4">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Прогноз ХВС</p>
                                 <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-black text-white">{averageMonthlyConsumption.avgCold.toFixed(2)}</span>
                                    <span className="text-[10px] font-bold text-blue-300 uppercase">м³</span>
                                 </div>
                              </div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <p className="text-[9px] font-black text-red-400 uppercase mb-1">Прогноз ГВС</p>
                                 <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-black text-white">{averageMonthlyConsumption.avgHot.toFixed(2)}</span>
                                    <span className="text-[10px] font-bold text-red-300 uppercase">м³</span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex flex-col justify-center border-l border-white/10 pl-8">
                              <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Ожидаемый итог</p>
                              <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-black text-white">{averageMonthlyConsumption.avgVol.toFixed(2)}</span>
                                <span className="text-sm font-bold text-indigo-300 uppercase">м³</span>
                              </div>
                              <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Примерная сумма</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-white">{averageMonthlyConsumption.estCost.toFixed(0)}</span>
                                <span className="text-sm font-bold text-indigo-300 uppercase">₽</span>
                              </div>
                           </div>
                        </div>
                        
                        <p className="text-[11px] text-indigo-300/70 font-medium leading-relaxed italic border-t border-white/5 pt-4">
                          Прогноз сформирован на основе анализа всех ваших предыдущих показаний. Помогает заранее спланировать расходы.
                        </p>
                      </div>
                   </div>
                   
                   <div className="bg-[#1e293b] border border-gray-700/50 p-8 rounded-[2.5rem] flex flex-col justify-center text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-6 tracking-widest">Статистика точности</p>
                      <div className="relative w-28 h-28 mx-auto mb-6">
                         <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
                            <circle 
                               cx="50" 
                               cy="50" 
                               r="42" 
                               stroke="currentColor" 
                               strokeWidth="8" 
                               fill="transparent" 
                               strokeDasharray="263.89" 
                               strokeDashoffset="26.39" 
                               strokeLinecap="round"
                               className="text-green-500 transition-all duration-1000" 
                            />
                         </svg>
                         <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-white">90%</div>
                      </div>
                      <p className="text-[9px] font-bold text-gray-500 uppercase leading-tight px-2">Вероятность совпадения прогноза</p>
                   </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* График ХВС */}
                <div className="bg-[#1e293b] p-8 rounded-[3rem] shadow-xl border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Динамика расхода ХВС</h3>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorCold" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area name="cold" type="monotone" dataKey="cold" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCold)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-6 italic font-medium">Холодная вода: фактическое потребление в м³ за каждый отчетный период.</p>
                </div>

                {/* График ГВС */}
                <div className="bg-[#1e293b] p-8 rounded-[3rem] shadow-xl border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Динамика расхода ГВС</h3>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorHot" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area name="hot" type="monotone" dataKey="hot" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorHot)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-6 italic font-medium">Горячая вода: фактическое потребление в м³ за каждый отчетный период.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
              <div id="tutorial-services" className="bg-[#1e293b] p-8 md:p-10 rounded-[3rem] shadow-xl border border-gray-700/50">
                <h3 className="text-2xl font-black text-white uppercase mb-8 tracking-tight">Заказ услуг</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <button 
                    onClick={() => setAppType('verification')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${appType === 'verification' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-gray-700 text-gray-500 hover:border-gray-600'}`}
                  >
                    <i className="fas fa-microscope text-2xl"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">Поверка<br/>счетчиков</span>
                  </button>
                  <button 
                    onClick={() => setAppType('replacement')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${appType === 'replacement' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-700 text-gray-500 hover:border-gray-600'}`}
                  >
                    <i className="fas fa-wrench text-2xl"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">Замена<br/>счетчиков</span>
                  </button>
                  <button 
                    onClick={() => setAppType('water_delivery')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${appType === 'water_delivery' ? 'border-cyan-500 bg-cyan-500/10 text-white' : 'border-gray-700 text-gray-500 hover:border-gray-600'}`}
                  >
                    <i className="fas fa-truck-droplet text-2xl"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">Подвоз<br/>воды</span>
                  </button>
                </div>

                <form onSubmit={handleAppSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {appType !== 'water_delivery' ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Счетчик</label>
                        <select 
                          value={appMeterType} 
                          onChange={(e) => setAppMeterType(e.target.value as MeterType)}
                          className="w-full px-5 py-4 bg-[#0f172a] border-none rounded-2xl font-bold text-white outline-none"
                        >
                          <option value="cold">Холодная вода</option>
                          <option value="hot">Горячая вода</option>
                          <option value="both">Оба счетчика</option>
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Объем (м³)</label>
                        <input 
                          type="number" 
                          min="0.1"
                          step="0.1"
                          value={deliveryVolume} 
                          onChange={e => setDeliveryVolume(e.target.value)}
                          className="w-full px-5 py-4 bg-[#0f172a] border-none rounded-2xl font-bold text-white outline-none"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Контактный телефон</label>
                      <input 
                        type="tel" 
                        value={appPhone} 
                        onChange={e => setAppPhone(e.target.value)}
                        className="w-full px-5 py-4 bg-[#0f172a] border-none rounded-2xl font-bold text-white outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  {appType === 'water_delivery' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Адрес доставки</label>
                      <input 
                        type="text" 
                        value={deliveryAddress} 
                        onChange={e => setDeliveryAddress(e.target.value)}
                        placeholder="Укажите адрес"
                        className="w-full px-5 py-4 bg-[#0f172a] border-none rounded-2xl font-bold text-white outline-none"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Желаемая дата и время</label>
                    <input 
                      type="datetime-local" 
                      value={appDateTime} 
                      onChange={e => setAppDateTime(e.target.value)}
                      className={`w-full px-5 py-4 bg-[#0f172a] border-2 rounded-2xl font-bold text-white outline-none transition-all ${appTimeError ? 'border-amber-500/50' : 'border-transparent'}`}
                      required
                    />
                    
                    {appTimeError && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-amber-500 animate-in fade-in slide-in-from-top-1 duration-300">
                        <i className="fas fa-clock shrink-0 text-sm"></i>
                        <span className="text-[10px] font-black uppercase tracking-widest leading-tight">
                          {appTimeError}
                        </span>
                      </div>
                    )}
                  </div>

                  <button 
                    disabled={isAppSubmitting || !!appTimeError}
                    type="submit" 
                    className={`w-full py-5 ${currentAccentBg} text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
                  >
                    {isAppSubmitting ? 'Отправка...' : appType === 'water_delivery' ? 'Заказать и получить счет' : 'Отправить заявку'}
                  </button>
                </form>
              </div>

              <div className="bg-[#1e293b] p-8 rounded-[3rem] shadow-xl border border-gray-700/50">
                <h3 className="text-xl font-black text-white uppercase mb-6 tracking-tight">Мои заявки</h3>
                <div className="space-y-4">
                  {applications.filter(a => a.status !== 'archived').length === 0 ? (
                    <p className="text-gray-400 italic text-center py-4">Активных заявок нет</p>
                  ) : (
                    applications.filter(a => a.status !== 'archived').map(app => (
                      <div key={app.id} className="p-5 bg-[#0f172a] rounded-2xl border border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center ${app.status === 'pending' ? 'text-amber-500' : app.status === 'in_progress' ? 'text-blue-500' : 'text-green-500'}`}>
                             <i className={`fas ${app.serviceType === 'verification' ? 'fa-microscope' : app.serviceType === 'replacement' ? 'fa-wrench' : 'fa-truck-droplet'}`}></i>
                          </div>
                          <div>
                            <p className="font-black text-white text-sm uppercase">
                              {app.serviceType === 'verification' ? 'Поверка' : app.serviceType === 'replacement' ? 'Замена' : 'Подвоз воды'}
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase font-black mt-1">
                              {new Date(app.preferredDateTime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {app.serviceType === 'water_delivery' && (
                            <button 
                              onClick={() => { setLastSubmittedApp(app); handleDownloadPdf('delivery', app); }}
                              className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                              title="Скачать счет"
                            >
                              <i className="fas fa-file-pdf"></i>
                            </button>
                          )}
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                            app.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                            app.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {app.status === 'completed' ? 'Готова' : app.status === 'in_progress' ? 'В работе' : 'Новая'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
              <div className="bg-[#1e293b] p-8 md:p-10 rounded-[3rem] shadow-xl border border-gray-700/50">
                <h3 className="text-2xl font-black text-white uppercase mb-8 tracking-tight">Мой профиль</h3>
                
                <form onSubmit={handleProfileUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">ФИО Абонента</label>
                      <input 
                        type="text" 
                        value={profileForm.fullName} 
                        onChange={e => setProfileForm({...profileForm, fullName: e.target.value})}
                        className="w-full px-5 py-4 bg-[#0f172a] border-none rounded-2xl font-bold text-white outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Телефон</label>
                      <input 
                        type="tel" 
                        value={profileForm.phone} 
                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                        className="w-full px-5 py-4 bg-[#0f172a] border-none rounded-2xl font-bold text-white outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Email</label>
                      <input 
                        type="email" 
                        value={profileForm.email} 
                        onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                        className="w-full px-5 py-4 bg-[#0f172a] border-none rounded-2xl font-bold text-white outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Поселение</label>
                      <select 
                        value={profileForm.settlement} 
                        onChange={e => setProfileForm({...profileForm, settlement: e.target.value})}
                        className="w-full px-5 py-4 bg-[#0f172a] border-none rounded-2xl font-bold text-white outline-none"
                      >
                        {PITKYARANTA_SETTLEMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Адрес проживания</label>
                      <input 
                        type="text" 
                        value={profileForm.address} 
                        onChange={e => setProfileForm({...profileForm, address: e.target.value})}
                        placeholder="Улица, дом, квартира"
                        className="w-full px-5 py-4 bg-[#0f172a] border-none rounded-2xl font-bold text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700/50">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Новый пароль</label>
                      <div className="relative">
                        <input 
                          type={showNewPassword ? "text" : "password"} 
                          value={profileForm.password || ''} 
                          onChange={e => setProfileForm({...profileForm, password: e.target.value})}
                          placeholder="Оставьте пустым, если не хотите менять"
                          className="w-full px-5 py-4 pr-14 bg-[#0f172a] border-none rounded-2xl font-bold text-white outline-none"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                          <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                        </button>
                      </div>
                      {profileForm.password && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase">
                            <span className="text-gray-500">Сложность:</span>
                            <span className={pwdStrength.text}>{pwdStrength.label}</span>
                          </div>
                          <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${pwdStrength.color}`} 
                              style={{ width: pwdStrength.width }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Подтверждение пароля</label>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          value={confirmPassword} 
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Введите пароль повторно"
                          className={`w-full px-5 py-4 pr-14 bg-[#0f172a] border-2 rounded-2xl font-bold text-white outline-none transition-all ${profileForm.password && confirmPassword && profileForm.password !== confirmPassword ? 'border-red-500/50' : 'border-transparent'}`}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                          <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-700/50">
                    <label className="text-[10px] font-black uppercase text-gray-400 block tracking-widest">Цветовая схема (меняется налету)</label>
                    <div className="flex flex-wrap gap-3">
                      {THEME_OPTIONS.map((theme) => (
                        <button 
                          key={theme.value} 
                          type="button"
                          onClick={() => setProfileForm({...profileForm, themeColor: theme.value})}
                          className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${profileForm.themeColor === theme.value ? 'border-white ' + accentBgClasses[theme.value] + ' text-white shadow-lg scale-105' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 block tracking-widest">Выбор аватара (меняется налету)</label>
                    <div className="flex flex-wrap gap-4">
                      {AVATAR_OPTIONS.map((url, i) => (
                        <button 
                          key={i} 
                          type="button"
                          onClick={() => setProfileForm({...profileForm, avatarUrl: url})}
                          className={`w-14 h-14 rounded-2xl border-2 overflow-hidden transition-all ${profileForm.avatarUrl === url ? 'border-primary-500 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        >
                          <img src={url} className="w-full h-full object-contain bg-white" alt="" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className={`w-full py-5 ${isProfileUpdateSuccess ? 'bg-green-600' : currentAccentBg} text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl`}
                  >
                    {isProfileUpdateSuccess ? 'Данные обновлены!' : 'Сохранить изменения'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
              <div className="bg-[#1e293b] p-8 md:p-10 rounded-[3rem] shadow-xl border border-gray-700/50">
                <h3 className="text-2xl font-black text-white uppercase mb-8 tracking-tight">Обратная связь</h3>
                
                <form onSubmit={handleFeedbackSubmit} className="space-y-6 mb-12">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Новое обращение</label>
                    <textarea 
                      value={feedbackText} 
                      onChange={e => setFeedbackText(e.target.value)}
                      placeholder="Опишите проблему или оставьте предложение..."
                      className="w-full px-6 py-5 bg-[#0f172a] border-none rounded-[2rem] font-bold text-white outline-none min-h-[150px] resize-none"
                    />
                  </div>
                  <button 
                    disabled={isFeedbackSubmitting}
                    type="submit" 
                    className={`w-full py-5 ${isFeedbackSuccess ? 'bg-green-600' : currentAccentBg} text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl disabled:opacity-50`}
                  >
                    {isFeedbackSubmitting ? 'Отправка...' : isFeedbackSuccess ? 'Сообщение отправлено!' : 'Отправить сообщение'}
                  </button>
                </form>

                <div className="space-y-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">История переписки</h4>
                  {userFeedbacks.length === 0 ? (
                    <p className="text-gray-500 italic text-center py-6 text-sm">История обращений пуста</p>
                  ) : (
                    userFeedbacks.map(f => (
                      <div key={f.id} className="space-y-3">
                        {/* Сообщение пользователя */}
                        <div className="flex justify-end pl-12">
                           <div className="bg-primary-600/10 border border-primary-500/20 p-5 rounded-2xl rounded-tr-none text-white max-w-full">
                              <p className="text-sm font-bold leading-relaxed">{f.text}</p>
                              <p className="text-[9px] text-primary-400 mt-2 font-black uppercase tracking-widest">{new Date(f.createdAt).toLocaleString()}</p>
                           </div>
                        </div>

                        {/* Ответ администрации */}
                        {f.adminReply && (
                          <div className="flex justify-start pr-12 animate-in slide-in-from-left-4 duration-500">
                             <div className="bg-indigo-500/10 border border-indigo-500/30 p-5 rounded-2xl rounded-tl-none text-white w-full relative">
                                {!f.isUserRead && (
                                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1e293b] animate-ping"></div>
                                )}
                                <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                  <i className="fas fa-headset"></i> Ответ администрации
                                </div>
                                <p className="text-sm font-bold leading-relaxed">{f.adminReply}</p>
                                <p className="text-[9px] text-indigo-400/60 mt-2 font-black uppercase tracking-widest">
                                  {new Date(f.repliedAt!).toLocaleString()}
                                </p>
                             </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
               <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-6">Архив квитанций</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {userReadings.slice().reverse().map(r => (
                   <div key={r.id} className="bg-[#1e293b] p-6 rounded-3xl border border-gray-700/50 flex justify-between items-center transition-all hover:bg-[#1e293b]/80 group">
                      <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{new Date(r.submissionDate).toLocaleDateString('ru-RU')}</p>
                        <p className="font-black text-white text-lg mt-1">Квитанция №{r.id}</p>
                      </div>
                      <button 
                        onClick={() => { setLastSubmittedReading(r); handleDownloadPdf('reading', r); }}
                        className={`px-6 py-3 ${currentAccentBg} text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all`}
                      >
                        Скачать
                      </button>
                   </div>
                 ))}
               </div>
            </div>
          )}

        </div>
      </div>

      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {lastSubmittedReading && (
          <div 
            ref={receiptTemplateRef}
            style={{ 
              width: '210mm', 
              height: '297mm', 
              padding: '10mm', 
              backgroundColor: '#fff', 
              fontFamily: 'Arial, sans-serif',
              color: '#000',
              boxSizing: 'border-box',
              border: '1px solid #e2e8f0',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '16px', fontWeight: '900', color: '#0369a1', margin: '0 0 4px 0', textTransform: 'uppercase' }}>{ORG_INFO.name}</h1>
                <p style={{ fontSize: '9px', margin: '1px 0', color: '#444' }}>{ORG_INFO.legalAddress}</p>
                <p style={{ fontSize: '9px', margin: '1px 0', color: '#444' }}>ИНН: 1005012345 | Тел: {ORG_INFO.phone}</p>
                <p style={{ fontSize: '9px', margin: '1px 0', color: '#444' }}>Email: {ORG_INFO.email}</p>
              </div>
              <div style={{ width: '45px', height: '45px', backgroundColor: '#0ea5e9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="30" height="30" viewBox="0 0 512 512" fill="#fff"><path d="M256 512C141.1 512 48 418.9 48 304c0-41.6 12.3-80.3 33.4-112.5C118.8 135 186.9 61.6 238.1 11.2c10.4-10.2 25.4-10.2 35.8 0 51.2 50.4 119.3 123.8 156.7 180.3 21.1 32.2 33.4 70.9 33.4 112.5 0 114.9-93.1 208-208 208z"/></svg>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#000', margin: '0', letterSpacing: '-0.5px' }}>
                КВИТАНЦИЯ №{lastSubmittedReading.id}
              </h2>
              <p style={{ fontSize: '11px', fontWeight: '900', color: '#0ea5e9', margin: '5px 0' }}>
                ПЕРИОД: {new Date(lastSubmittedReading.submissionDate).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).toUpperCase()}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'flex-end' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '15px', width: '60%', border: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>АБОНЕНТ</p>
                <p style={{ fontSize: '15px', fontWeight: '900', color: '#000', margin: '0' }}>{user.fullName}</p>
                <div style={{ margin: '8px 0' }}>
                  <span style={{ fontSize: '13px', fontWeight: '900', color: '#0ea5e9' }}>Лицевой счет: </span>
                  <span style={{ fontSize: '13px', fontWeight: '900', color: '#000' }}>{user.accountNumber}</span>
                </div>
                <p style={{ fontSize: '10px', fontWeight: '700', color: '#444', margin: '0' }}>{user.settlement}, {user.address}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '85px', height: '85px', border: '1px solid #000', padding: '4px', margin: '0 auto 4px', background: '#fff' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=https://pay.pitk.ru/${user.accountNumber}`} alt="QR" style={{ width: '100%' }} />
                </div>
                <p style={{ fontSize: '8px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>QR-код для оплаты</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', border: '1px solid #0ea5e9' }}>
              <thead>
                <tr style={{ backgroundColor: '#0ea5e9', color: '#fff' }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}>Услуга</th>
                  <th style={{ padding: '10px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}>Пред.</th>
                  <th style={{ padding: '10px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}>Текущ.</th>
                  <th style={{ padding: '10px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}>Расход</th>
                  <th style={{ padding: '10px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}>Тариф</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const c = getReadingCalculation(lastSubmittedReading);
                  const items = [
                    { name: 'Холодная вода №1 (ХВС)', pred: c.coldPrev, cur: lastSubmittedReading.coldWater, diff: c.coldDiff, tar: ORG_INFO.tariffs.cold, sum: c.coldDiff * ORG_INFO.tariffs.cold },
                  ];
                  if (user.hasDualMeters) {
                    items.push({ name: 'Холодная вода №2 (ХВС)', pred: c.coldPrev2, cur: lastSubmittedReading.coldWater2, diff: c.coldDiff2, tar: ORG_INFO.tariffs.cold, sum: c.coldDiff2 * ORG_INFO.tariffs.cold });
                  }
                  items.push({ name: 'Горячая вода №1 (ГВС)', pred: c.hotPrev, cur: lastSubmittedReading.hotWater, diff: c.hotDiff, tar: ORG_INFO.tariffs.hot, sum: c.hotDiff * ORG_INFO.tariffs.hot });
                  if (user.hasDualMeters) {
                    items.push({ name: 'Горячая вода №2 (ГВС)', pred: c.hotPrev2, cur: lastSubmittedReading.hotWater2, diff: c.hotDiff2, tar: ORG_INFO.tariffs.hot, sum: c.hotDiff2 * ORG_INFO.tariffs.hot });
                  }
                  items.push({ name: 'Водоотведение', pred: '—', cur: '—', diff: c.totalVol, tar: ORG_INFO.tariffs.disposal, sum: c.disposalCost });
                  
                  return items.map((it, i) => (
                    <tr key={i} style={{ backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 10px', fontSize: '11px', fontWeight: '900', color: '#000', textAlign: 'left' }}>{it.name}</td>
                      <td style={{ padding: '12px 10px', fontSize: '11px', fontWeight: '700', color: '#000', textAlign: 'center' }}>{typeof it.pred === 'number' ? it.pred.toFixed(2) : it.pred}</td>
                      <td style={{ padding: '12px 10px', fontSize: '11px', fontWeight: '900', color: '#000', textAlign: 'center' }}>{typeof it.cur === 'number' ? it.cur.toFixed(2) : it.cur}</td>
                      <td style={{ padding: '12px 10px', fontSize: '11px', fontWeight: '900', color: '#000', textAlign: 'center' }}>{typeof it.diff === 'number' ? it.diff.toFixed(2) : it.diff}</td>
                      <td style={{ padding: '12px 10px', fontSize: '11px', fontWeight: '700', color: '#000', textAlign: 'center' }}>{it.tar.toFixed(2)}</td>
                      <td style={{ padding: '12px 10px', fontSize: '12px', fontWeight: '900', color: '#000', textAlign: 'right' }}>{it.sum.toFixed(2)} ₽</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', marginBottom: '80px', paddingRight: '10px' }}>
              <div style={{ display: 'inline-block' }}>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#000', marginRight: '20px' }}>ИТОГО:</span>
                <span style={{ fontSize: '42px', fontWeight: '900', color: '#0ea5e9' }}>{getReadingCalculation(lastSubmittedReading).total.toFixed(2)} ₽</span>
              </div>
            </div>

            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <div style={{ width: '40%' }}>
                <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '25px' }}>БУХГАЛТЕР</p>
                <div style={{ borderBottom: '1px solid #000', width: '100%', height: '1px' }}></div>
              </div>
              <div style={{ width: '40%' }}>
                <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '25px' }}>АБОНЕНТ</p>
                <div style={{ borderBottom: '1px solid #000', width: '100%', height: '1px' }}></div>
              </div>

              <div style={{ 
                position: 'absolute', 
                bottom: '-20px', 
                right: '40px', 
                width: '130px', 
                height: '130px', 
                border: '3px double rgba(0, 0, 255, 0.5)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                transform: 'rotate(-15deg)', 
                pointerEvents: 'none',
                color: 'rgba(0, 0, 255, 0.5)',
                textAlign: 'center',
                fontSize: '8px',
                fontWeight: '900',
                padding: '5px'
              }}>
                <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '1px solid rgba(0, 0, 255, 0.5)', transform: 'scale(0.88)' }}></div>
                <span style={{ textTransform: 'uppercase' }}>РЕСПУБЛИКА КАРЕЛИЯ<br/>МКУ ПМО<br/>ХОЗУПРАВЛЕНИЕ<br/>ПИТКЯРАНТА</span>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: '10mm', left: '10mm', fontSize: '9px', color: '#94a3b8', fontWeight: '700' }}>
              Сформировано автоматически в ИС МКУ ПМО "Хозуправление". Копия верна. {new Date().toLocaleDateString('ru-RU')}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {lastSubmittedApp && lastSubmittedApp.serviceType === 'water_delivery' && (
          <div 
            ref={deliveryBillTemplateRef}
            style={{ 
              width: '210mm', 
              height: '297mm', 
              padding: '10mm', 
              backgroundColor: '#fff', 
              fontFamily: 'Arial, sans-serif',
              color: '#000',
              boxSizing: 'border-box',
              border: '1px solid #e2e8f0',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '16px', fontWeight: '900', color: '#0369a1', margin: '0 0 4px 0', textTransform: 'uppercase' }}>{ORG_INFO.name}</h1>
                <p style={{ fontSize: '9px', margin: '1px 0', color: '#444' }}>{ORG_INFO.legalAddress}</p>
                <p style={{ fontSize: '9px', margin: '1px 0', color: '#444' }}>ИНН: 1005012345 | Тел: {ORG_INFO.phone}</p>
              </div>
              <div style={{ width: '45px', height: '45px', backgroundColor: '#0ea5e9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-truck-droplet" style={{ fontSize: '24px', color: '#fff' }}></i>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#000', margin: '0', letterSpacing: '-0.5px' }}>
                СЧЕТ НА ОПЛАТУ №{lastSubmittedApp.id}
              </h2>
              <p style={{ fontSize: '11px', fontWeight: '900', color: '#0ea5e9', margin: '5px 0' }}>
                ДАТА ФОРМИРОВАНИЯ: {new Date().toLocaleDateString('ru-RU')}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '15px', width: '60%', border: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>АБОНЕНТ</p>
                <p style={{ fontSize: '15px', fontWeight: '900', color: '#000', margin: '0' }}>{user.fullName}</p>
                <p style={{ fontSize: '13px', fontWeight: '900', color: '#000' }}>Л/С: {user.accountNumber}</p>
                <p style={{ fontSize: '10px', fontWeight: '700', color: '#444', margin: '5px 0 0' }}>Адрес доставки: {lastSubmittedApp.deliveryAddress}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '85px', height: '85px', border: '1px solid #000', padding: '4px', margin: '0 auto 4px', background: '#fff' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=https://pay.pitk.ru/service/${lastSubmittedApp.id}`} alt="QR" style={{ width: '100%' }} />
                </div>
                <p style={{ fontSize: '8px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>Оплатить по QR</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', border: '1px solid #0ea5e9' }}>
              <thead>
                <tr style={{ backgroundColor: '#0ea5e9', color: '#fff' }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}>Услуга</th>
                  <th style={{ padding: '10px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}>Объем</th>
                  <th style={{ padding: '10px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}>Тариф</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}>Сумма</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px 10px', fontSize: '12px', fontWeight: '900', color: '#000' }}>Подвоз питьевой воды</td>
                  <td style={{ padding: '15px 10px', fontSize: '12px', fontWeight: '700', color: '#000', textAlign: 'center' }}>{lastSubmittedApp.deliveryVolume} м³</td>
                  <td style={{ padding: '15px 10px', fontSize: '12px', fontWeight: '700', color: '#000', textAlign: 'center' }}>{ORG_INFO.tariffs.delivery.toFixed(2)} ₽</td>
                  <td style={{ padding: '15px 10px', fontSize: '14px', fontWeight: '900', color: '#000', textAlign: 'right' }}>{((lastSubmittedApp.deliveryVolume || 0) * ORG_INFO.tariffs.delivery).toFixed(2)} ₽</td>
                </tr>
              </tbody>
            </table>

            <div style={{ textAlign: 'right', marginBottom: '80px', paddingRight: '10px' }}>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#000', marginRight: '20px' }}>ИТОГО К ОПЛАТЕ:</span>
              <span style={{ fontSize: '42px', fontWeight: '900', color: '#0ea5e9' }}>{((lastSubmittedApp.deliveryVolume || 0) * ORG_INFO.tariffs.delivery).toFixed(2)} ₽</span>
            </div>

            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <div style={{ width: '40%' }}>
                <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '25px' }}>ОТПУСТИЛ</p>
                <div style={{ borderBottom: '1px solid #000', width: '100%', height: '1px' }}></div>
              </div>
              <div style={{ width: '40%' }}>
                <p style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '25px' }}>ПОЛУЧИЛ</p>
                <div style={{ borderBottom: '1px solid #000', width: '100%', height: '1px' }}></div>
              </div>
              <div style={{ 
                position: 'absolute', bottom: '-20px', right: '40px', width: '130px', height: '130px', 
                border: '3px double rgba(0, 0, 255, 0.4)', borderRadius: '50%', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', transform: 'rotate(-10deg)', 
                color: 'rgba(0, 0, 255, 0.4)', textAlign: 'center', fontSize: '8px', fontWeight: '900'
              }}>
                <span style={{ textTransform: 'uppercase' }}>МКУ ПМО<br/>ХОЗУПРАВЛЕНИЕ<br/>ПИТКЯРАНТА</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {isSuccessModalOpen && lastSubmittedReading && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[400] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl relative animate-in zoom-in duration-300 text-center">
             <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-2xl shadow-green-500/40">
               <i className="fas fa-check"></i>
             </div>
             <h3 className="text-3xl font-black mb-4">Данные приняты!</h3>
             <p className="text-gray-500 font-medium mb-10 leading-relaxed text-center">
               Показания успешно переданы. Квитанция готова к скачиванию. Пожалуйста, оплатите счет до 10 числа.
             </p>
             <div className="space-y-3">
               <button 
                onClick={() => handleDownloadPdf('reading')}
                disabled={isGeneratingPdf}
                className={`w-full py-5 ${currentAccentBg} text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all disabled:opacity-50`}
               >
                 {isGeneratingPdf ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-file-pdf"></i>}
                 {isGeneratingPdf ? 'Создание квитанции...' : 'Скачать квитанцию (PDF)'}
               </button>
               <button 
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full py-5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
               >
                 Закрыть
               </button>
             </div>
          </div>
        </div>
      )}

      {isAppSuccessModalOpen && lastSubmittedApp && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[400] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl relative animate-in zoom-in duration-300 text-center">
             <div className={`w-24 h-24 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-2xl ${lastSubmittedApp.serviceType === 'water_delivery' ? 'bg-cyan-500 shadow-cyan-500/40' : 'bg-green-500 shadow-green-500/40'}`}>
               <i className={`fas ${lastSubmittedApp.serviceType === 'water_delivery' ? 'fa-truck-droplet' : 'fa-check'}`}></i>
             </div>
             <h3 className="text-3xl font-black mb-4 text-center">Заявка принята!</h3>
             <p className="text-gray-500 font-medium mb-10 leading-relaxed text-center">
               Ваша заявка №{lastSubmittedApp.id} на {lastSubmittedApp.serviceType === 'water_delivery' ? 'подвоз воды' : 'обслуживание'} успешно создана. {lastSubmittedApp.serviceType === 'water_delivery' ? 'Вы можете скачать счет прямо сейчас для оплаты.' : 'Специалисты свяжутся с вами в ближайшее рабочее время.'}
             </p>
             <div className="space-y-3">
               {lastSubmittedApp.serviceType === 'water_delivery' && (
                 <button 
                  onClick={() => handleDownloadPdf('delivery')}
                  disabled={isGeneratingPdf}
                  className={`w-full py-5 bg-cyan-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all disabled:opacity-50`}
                 >
                   {isGeneratingPdf ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-file-invoice-dollar"></i>}
                   {isGeneratingPdf ? 'Создание счета...' : 'Скачать счет на оплату (PDF)'}
                 </button>
               )}
               <button 
                onClick={() => setIsAppSuccessModalOpen(false)}
                className="w-full py-5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
               >
                 Понятно
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
