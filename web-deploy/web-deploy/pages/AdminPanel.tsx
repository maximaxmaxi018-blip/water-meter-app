
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, WaterReading, ServiceApplication, ApplicationStatus, NewsItem, NewsType, FeedbackItem, Plumber } from '../types';
import { PITKYARANTA_SETTLEMENTS, ORG_INFO } from '../constants';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import apiClient from '../services/apiClient';

interface AdminPanelProps {
  users: User[];
  readings: WaterReading[];
  applications: ServiceApplication[];
  news: NewsItem[];
  feedbacks: FeedbackItem[];
  plumbers: Plumber[];
  onUpdateUsers: (action: User[] | ((prev: User[]) => User[])) => void;
  onUpdateReadings: (action: WaterReading[] | ((prev: WaterReading[]) => WaterReading[])) => void;
  onUpdateApplicationStatus: (appId: string, status: ApplicationStatus) => void;
  onUpdateApplications: (action: ServiceApplication[] | ((prev: ServiceApplication[]) => ServiceApplication[])) => void;
  onUpdateNews: (action: NewsItem[] | ((prev: NewsItem[]) => NewsItem[])) => void;
  onUpdateFeedbacks: (action: FeedbackItem[] | ((prev: FeedbackItem[]) => FeedbackItem[])) => void;
  onUpdatePlumbers: (action: Plumber[] | ((prev: Plumber[]) => Plumber[])) => void;
  isNewYear: boolean;
  onToggleNewYear: () => void;
  isEducationEnabled: boolean;
  onToggleEducation: () => void;
  onRefreshData?: () => void;
  onViewManual?: () => void;
}

const AvatarImage = ({ user, className }: { user: User, className?: string }) => {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [user.avatarUrl]);

  if (!user.avatarUrl || imgError) {
    const initials = user.isLegalEntity ? '' : (user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || '?');
    return (
      <div className={`flex items-center justify-center bg-white dark:bg-gray-800 text-[10px] font-black text-gray-400 ${className}`}>
        {user.isLegalEntity ? <i className="fas fa-building text-primary-500"></i> : initials}
      </div>
    );
  }
  return <img src={user.avatarUrl} alt="" className={`${className} object-contain`} onError={() => setImgError(true)} />;
};

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  users, readings, applications, news, feedbacks, plumbers,
  onUpdateUsers, onUpdateReadings, onUpdateApplicationStatus, onUpdateApplications, onUpdateNews, onUpdateFeedbacks, onUpdatePlumbers,
  isNewYear, onToggleNewYear, isEducationEnabled, onToggleEducation, onRefreshData, onViewManual
}) => {
  // Log component mount
  console.log('✓ AdminPanel component mounted/rendered');
  console.log('Props: users=%d, readings=%d, applications=%d, news=%d, feedbacks=%d, plumbers=%d', 
    users?.length || 0, readings?.length || 0, applications?.length || 0, 
    news?.length || 0, feedbacks?.length || 0, plumbers?.length || 0);
  
  // Проверяем, что компонент действительно рендерится
  console.log('AdminPanel is rendering! Current time:', new Date().toISOString());
  
  const [activeTab, setActiveTab] = useState<'users' | 'applications' | 'plumbers' | 'news' | 'feedback' | 'reports'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey] = useState<keyof User>('accountNumber');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const executiveReportRef = useRef<HTMLDivElement>(null);
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingReadingsUser, setViewingReadingsUser] = useState<User | null>(null);
  const [viewingApplication, setViewingApplication] = useState<ServiceApplication | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [editingPlumber, setEditingPlumber] = useState<Plumber | null>(null);
  const [assigningApplicationId, setAssigningApplicationId] = useState<string | null>(null);

  // State for feedback replies
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  const [csvPeriodType, setCsvPeriodType] = useState<'day' | 'month' | 'all'>('month');
  const [csvDate, setCsvDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [csvMonth, setCsvMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [statsPeriodType, setStatsPeriodType] = useState<'day' | 'month' | 'all'>('month');
  const [statsDate, setStatsDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [statsMonth, setStatsMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [newReadingCold, setNewReadingCold] = useState('');
  const [newReadingHot, setNewReadingHot] = useState('');
  const [newReadingCold2, setNewReadingCold2] = useState('');
  const [newReadingHot2, setNewReadingHot2] = useState('');

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefreshData) {
        const result = await onRefreshData();
        console.log('✓ Refresh completed, users count:', users?.length);
      }
      // Дополнительная задержка для гарантии обновления
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error('✗ Refresh error:', error);
      alert('Ошибка при обновлении данных: ' + (error as any).message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      let text = event.target?.result as string;
      if (!text) return;

      // Удаляем BOM (Byte Order Mark) если он есть
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
      }

      // Если текст содержит иероглифы/повреждённые символы, пробуем альтернативный способ
      // Читаем файл ещё раз как массив байт и пробуем кодировку Windows-1251
      if (text.includes('?') || /[^\x00-\x7F]/g.test(text)) {
        const byteReader = new FileReader();
        byteReader.onload = (byteEvent) => {
          try {
            const bytes = new Uint8Array(byteEvent.target?.result as ArrayBuffer);
            // Пробуем декодировать как Windows-1251
            const decoder = new TextDecoder('windows-1251');
            text = decoder.decode(bytes);
            
            // Удаляем BOM если есть
            if (text.charCodeAt(0) === 0xFEFF) {
              text = text.slice(1);
            }
            
            parseAndImportUsers(text);
          } catch (e) {
            // Если windows-1251 не работает, используем исходный текст
            parseAndImportUsers(text);
          }
        };
        byteReader.readAsArrayBuffer(file);
      } else {
        parseAndImportUsers(text);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseAndImportUsers = (text: string) => {
    // Пытаемся определить разделитель (;, запятая или табуляция)
    const lines = text.split(/\r?\n/);
    let delimiter = ';';
    
    if (lines.length > 1 && lines[0]) {
      // Проверяем какой разделитель используется в первой строке
      if (lines[0].includes(',') && !lines[0].includes(';')) {
        delimiter = ',';
      } else if (lines[0].includes('\t')) {
        delimiter = '\t';
      }
    }

    const newUsers: User[] = [];
    
    lines.forEach((line, idx) => {
      if (!line.trim()) return;
      
      // Пропускаем только явно заголовочные строки (содержат кириллицу в названиях)
      if (idx === 0 && (line.includes('Л/') || line.includes('ФИО') || line.includes('Абонент'))) {
        return; // Это заголовок, пропускаем
      }
      
      // Удаляем кавычки если они есть в начале и конце
      let cleanLine = line.trim();
      if (cleanLine.startsWith('"') && cleanLine.endsWith('"')) {
        cleanLine = cleanLine.slice(1, -1);
      }
      
      const parts = cleanLine.split(delimiter).map(p => {
        let part = p.trim();
        // Удаляем кавычки из каждой части
        if (part.startsWith('"') && part.endsWith('"')) {
          part = part.slice(1, -1);
        }
        return part;
      });
      
      if (parts.length < 2) return;

      const accountNumber = parts[0].trim();
      if (!accountNumber || users.some(u => u.accountNumber === accountNumber)) return;

      newUsers.push({
        id: 'imported_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        accountNumber,
        fullName: parts[1]?.trim() || 'ФИО не указано',
        settlement: parts[2]?.trim() || 'г. Питкяранта',
        address: parts[3]?.trim() || '',
        phone: parts[4]?.trim() || '',
        email: parts[5]?.trim() || '',
        isAdmin: false,
        isLegalEntity: false
      });
    });

    if (newUsers.length > 0) {
      // Отправляем на бэкэнд
      apiClient.post('/users/import', { users: newUsers }).then(() => {
        onUpdateUsers(prev => [...prev, ...newUsers]);
        alert(`Успешно импортировано абонентов: ${newUsers.length}`);
      }).catch((err) => {
        alert('Ошибка при импорте: ' + err.message);
      });
    } else {
      alert('Новых абонентов не найдено (возможно, все Л/С уже есть в базе или файл пуст).');
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      if (editingUser.id) {
        // Обновление пользователя
        await apiClient.updateUser(editingUser.id, editingUser);
        onUpdateUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
      } else {
        // Создание нового пользователя
        const response = await apiClient.createUser(editingUser);
        const newUser = { ...editingUser, id: response.id, isAdmin: false };
        onUpdateUsers(prev => [...prev, newUser]);
      }
      setEditingUser(null);
    } catch (error: any) {
      alert('Ошибка при сохранении пользователя: ' + error.message);
    }
  };

  const handleAddReadingAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingReadingsUser) return;
    const cold = parseFloat(newReadingCold);
    const hot = parseFloat(newReadingHot);
    const cold2 = viewingReadingsUser.hasDualMeters ? parseFloat(newReadingCold2) : NaN;
    const hot2 = viewingReadingsUser.hasDualMeters ? parseFloat(newReadingHot2) : NaN;
    
    if (isNaN(cold) || isNaN(hot)) return;
    if (viewingReadingsUser.hasDualMeters && (isNaN(cold2) || isNaN(hot2))) return;

    try {
      const readingData = {
        userId: viewingReadingsUser.id,
        coldWater: cold,
        hotWater: hot,
        coldWater2: viewingReadingsUser.hasDualMeters ? cold2 : null,
        hotWater2: viewingReadingsUser.hasDualMeters ? hot2 : null
      };

      const response = await apiClient.createReading(readingData);

      const newReading: WaterReading = {
        id: response.id,
        userId: viewingReadingsUser.id,
        coldWater: cold,
        hotWater: hot,
        coldWater2: viewingReadingsUser.hasDualMeters ? cold2 : undefined,
        hotWater2: viewingReadingsUser.hasDualMeters ? hot2 : undefined,
        submissionDate: new Date().toISOString()
      };

      onUpdateReadings(prev => [...prev, newReading]);
      setNewReadingCold('');
      setNewReadingHot('');
      setNewReadingCold2('');
      setNewReadingHot2('');
    } catch (error: any) {
      alert('Ошибка при добавлении показаний: ' + error.message);
    }
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;
    if (editingNews.id) {
      onUpdateNews(prev => prev.map(n => n.id === editingNews.id ? editingNews : n));
    } else {
      const newEntry: NewsItem = { ...editingNews, id: 'N' + Date.now(), createdAt: new Date().toISOString() };
      onUpdateNews(prev => [newEntry, ...prev]);
    }
    setEditingNews(null);
  };

  const handleSendFeedbackReply = (feedbackId: string) => {
    const text = replyTexts[feedbackId];
    if (!text?.trim()) return;

    onUpdateFeedbacks(prev => prev.map(f => 
      f.id === feedbackId 
        ? { ...f, adminReply: text, repliedAt: new Date().toISOString(), isRead: true, isUserRead: false } 
        : f
    ));
    
    setReplyTexts(prev => {
      const next = { ...prev };
      delete next[feedbackId];
      return next;
    });
  };

  const handleSavePlumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlumber) return;
    if (editingPlumber.id) {
      onUpdatePlumbers(prev => prev.map(p => p.id === editingPlumber.id ? editingPlumber : p));
    } else {
      const newPlumber = { ...editingPlumber, id: 'P' + Date.now(), createdAt: new Date().toISOString() };
      onUpdatePlumbers(prev => [...prev, newPlumber]);
    }
    setEditingPlumber(null);
  };

  const handleAssignPlumber = (appId: string, plumberId: string) => {
    onUpdateApplications(prev => prev.map(a => 
      a.id === appId 
        ? { ...a, plumberId, assignedAt: new Date().toISOString() } 
        : a
    ));
    if (viewingApplication && viewingApplication.id === appId) {
      setViewingApplication({...viewingApplication, plumberId, assignedAt: new Date().toISOString()});
    }
    setAssigningApplicationId(null);
  };

  const filteredAndSortedUsers = useMemo(() => {
    return (users || [])
      .filter(u => {
        const name = u.isLegalEntity ? `${u.legalEntityType || ''} ${u.companyName || ''}` : u.fullName || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) || (u.accountNumber || '').includes(searchTerm);
      })
      .sort((a, b) => {
        const valA = String(a[sortKey] || '').toLowerCase();
        const valB = String(b[sortKey] || '').toLowerCase();
        return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
  }, [users, searchTerm, sortKey, sortOrder]);

  const stats = useMemo(() => {
    let fReadings = readings;
    let fApps = applications;
    let label = statsPeriodType === 'day' ? statsDate : statsPeriodType === 'month' ? statsMonth : "Весь период";
    
    if (statsPeriodType === 'day') {
      fReadings = readings.filter(r => r.submissionDate.startsWith(statsDate));
      fApps = applications.filter(a => a.createdAt.startsWith(statsDate));
    } else if (statsPeriodType === 'month') {
      fReadings = readings.filter(r => r.submissionDate.startsWith(statsMonth));
      fApps = applications.filter(a => a.createdAt.startsWith(statsMonth));
    }

    const uniqueActive = new Set(fReadings.map(r => r.userId)).size;

    return {
      label,
      totalUsers: users.length,
      legalUsers: users.filter(u => u.isLegalEntity).length,
      activeUsers: users.filter(u => u.password).length,
      uniqueUsersReadings: uniqueActive,
      coveragePercent: users.length > 0 ? ((uniqueActive / users.length) * 100).toFixed(1) : '0',
      totalApps: fApps.length,
      verification: fApps.filter(a => a.serviceType === 'verification').length,
      replacement: fApps.filter(a => a.serviceType === 'replacement').length,
      delivery: fApps.filter(a => a.serviceType === 'water_delivery').length,
      volume: fApps.filter(a => a.serviceType === 'water_delivery').reduce((s, a) => s + (a.deliveryVolume || 0), 0)
    };
  }, [statsPeriodType, statsDate, statsMonth, readings, applications, users]);

  const handleDownloadExecutiveReport = async () => {
    if (isGeneratingPdf || !executiveReportRef.current) return;
    setIsGeneratingPdf(true);
    try {
      window.scrollTo(0,0);
      await new Promise(r => setTimeout(r, 800));
      const canvas = await html2canvas(executiveReportRef.current, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true
      });
      const pdf = new jsPDF('p', 'mm', 'a4', true);
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save(`Аналитическая_справка_${stats.label}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally { setIsGeneratingPdf(false); }
  };

  const toggleEducationWithReset = () => {
    if (!isEducationEnabled) {
      localStorage.removeItem('tutorial_completed');
    }
    onToggleEducation();
  };

  const newApplicationsCount = useMemo(() => applications.filter(a => a.status === 'pending').length, [applications]);
  const newFeedbacksCount = useMemo(() => feedbacks.filter(f => !f.isRead).length, [feedbacks]);

  const getStatusColor = (status: ApplicationStatus) => {
    switch(status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'archived': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    switch(status) {
      case 'pending': return 'НОВАЯ';
      case 'in_progress': return 'В РАБОТЕ';
      case 'completed': return 'ГОТОВА';
      case 'archived': return 'АРХИВ';
      default: return '---';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative text-left">
      
      <input type="file" ref={fileInputRef} onChange={handleCsvImport} accept=".csv" className="hidden" />
      
      <div className="flex justify-end mb-6 space-x-4">
        <button onClick={onViewManual} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">Инструкция</button>
        <button onClick={triggerRefresh} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-400">
          <i className={`fas fa-sync-alt ${isRefreshing ? 'animate-spin' : ''}`}></i>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: 'users', label: 'Абоненты', icon: 'fa-users' },
          { id: 'applications', label: 'Заявки', icon: 'fa-clipboard-list', badge: newApplicationsCount },
          { id: 'plumbers', label: 'Сантехники', icon: 'fa-wrench' },
          { id: 'news', label: 'Новости', icon: 'fa-newspaper' },
          { id: 'feedback', label: 'Отзывы', icon: 'fa-comments', badge: newFeedbacksCount },
          { id: 'reports', label: 'Отчеты', icon: 'fa-file-invoice' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500'}`}
          >
            <i className={`fas ${tab.icon}`}></i> {tab.label}
            {tab.badge && tab.badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-black ring-2 ring-white dark:ring-gray-950 animate-bounce">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in duration-500">
          <div className="p-8 border-b dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Реестр абонентов</h3>
            <div className="flex gap-3 w-full md:w-auto">
              <input type="text" placeholder="Поиск по Л/С или ФИО..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-5 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold flex-1 md:w-64 dark:text-white" />
              <div className="flex gap-2">
                <button 
                  onClick={() => triggerRefresh()} 
                  disabled={isRefreshing}
                  className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isRefreshing ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  title="Обновить данные пользователей с сервера"
                >
                  <i className={`fas fa-sync-alt ${isRefreshing ? 'animate-spin' : ''} mr-1`}></i> Обновить
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">
                  <i className="fas fa-file-import mr-1"></i> Импорт
                </button>
                <button onClick={() => setEditingUser({ id: '', accountNumber: '', fullName: '', settlement: 'г. Питкяранта', address: '', phone: '', email: '', isAdmin: false, isLegalEntity: false })} className="px-6 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">+ Абонент</button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-6 py-4">Л/С</th>
                  <th className="px-6 py-4">Абонент / Адрес</th>
                  <th className="px-6 py-4">Пароль</th>
                  <th className="px-6 py-4 text-center">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredAndSortedUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-5 font-mono font-black text-primary-600 dark:text-primary-400">{u.accountNumber}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0">
                          <AvatarImage user={u} className="w-full h-full" />
                        </div>
                        <div>
                          <p onClick={() => setViewingReadingsUser(u)} className="font-black text-gray-900 dark:text-white text-sm cursor-pointer hover:text-primary-600 transition-colors underline decoration-primary-500/30">
                            {u.isLegalEntity ? `${u.legalEntityType} ${u.companyName}` : u.fullName}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{u.settlement}, {u.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg">
                        {u.password || '---'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setEditingUser(u)} className="w-9 h-9 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                          <i className="fas fa-edit text-xs"></i>
                        </button>
                        <button onClick={() => setViewingReadingsUser(u)} className="w-9 h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-700 text-gray-500 rounded-xl hover:bg-gray-200 transition-all">
                          <i className="fas fa-history text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden p-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Управление заявками</h3>
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${showArchived ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              {showArchived ? 'Скрыть архив' : 'Показать архив'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications
              .filter(a => showArchived ? a.status === 'archived' : a.status !== 'archived')
              .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(app => {
                const u = users.find(user => user.id === app.userId);
                return (
                  <div key={app.id} onClick={() => setViewingApplication(app)} className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${app.status === 'pending' ? 'border-amber-400 bg-amber-50/5 shadow-lg shadow-amber-500/5 animate-pulse-subtle' : app.status === 'in_progress' ? 'border-blue-400 bg-blue-50/5 shadow-md shadow-blue-500/5' : app.status === 'completed' ? 'border-green-400 bg-green-50/5 opacity-80' : 'border-gray-700 opacity-50 bg-gray-900'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${app.serviceType === 'water_delivery' ? 'bg-blue-500 text-white' : 'bg-indigo-500 text-white'} shadow-lg`}>
                        <i className={`fas ${app.serviceType === 'verification' ? 'fa-microscope' : app.serviceType === 'replacement' ? 'fa-wrench' : 'fa-truck-droplet'}`}></i>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 ${getStatusColor(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="font-black text-gray-900 dark:text-white leading-tight uppercase text-sm">
                          {app.serviceType === 'verification' ? 'Поверка счетчика' : app.serviceType === 'replacement' ? 'Замена счетчика' : 'Подвоз воды'}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {app.id} • {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Абонент</p>
                        <p className="font-black text-xs text-gray-700 dark:text-gray-300 truncate">{u?.fullName || '---'}</p>
                        <p className="text-[10px] font-bold text-gray-500 mt-0.5 truncate">{u?.address}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          {applications.filter(a => showArchived ? a.status === 'archived' : a.status !== 'archived').length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-3xl flex items-center justify-center text-gray-300 text-3xl mx-auto mb-6"><i className="fas fa-folder-open"></i></div>
              <p className="text-gray-400 italic">В этом разделе пока нет заявок</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'plumbers' && (
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden p-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Управление сантехниками</h3>
            <button 
              onClick={() => setEditingPlumber({ id: '', fullName: '', phone: '', email: '', specialization: 'general', isActive: true, createdAt: new Date().toISOString() })}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
            >+ Добавить</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plumbers.map(plumber => {
              const assignedCount = applications.filter(a => a.plumberId === plumber.id && a.status === 'in_progress').length;
              const completedCount = applications.filter(a => a.plumberId === plumber.id && a.status === 'completed').length;
              return (
                <div key={plumber.id} className={`p-6 rounded-[2rem] border-2 transition-all ${plumber.isActive ? 'border-green-400 bg-green-50/5 shadow-md' : 'border-gray-400 bg-gray-50/5 opacity-70'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${plumber.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'} shadow-lg`}>
                      <i className="fas fa-wrench"></i>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingPlumber(plumber)}
                        className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <i className="fas fa-edit text-xs"></i>
                      </button>
                      <button 
                        onClick={() => { if(confirm('Удалить сантехника?')) onUpdatePlumbers(prev => prev.filter(p => p.id !== plumber.id)) }}
                        className="w-8 h-8 flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white leading-tight text-sm">{plumber.fullName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        {plumber.specialization === 'verification' ? 'Поверка счетчиков' : plumber.specialization === 'replacement' ? 'Замена счетчиков' : 'Универсальный специалист'}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Контакты</p>
                      <p className="text-xs font-bold text-primary-600 truncate">{plumber.phone}</p>
                      {plumber.email && <p className="text-xs font-bold text-gray-500 truncate">{plumber.email}</p>}
                    </div>
                    <div className="flex gap-2 text-[10px] font-black text-center">
                      <div className="flex-1 bg-blue-100 dark:bg-blue-900/20 px-2 py-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                        {assignedCount} в работе
                      </div>
                      <div className="flex-1 bg-green-100 dark:bg-green-900/20 px-2 py-1.5 rounded-lg text-green-600 dark:text-green-400">
                        {completedCount} выполнено
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {plumbers.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-3xl flex items-center justify-center text-gray-300 text-3xl mx-auto mb-6"><i className="fas fa-folder-open"></i></div>
              <p className="text-gray-400 italic">Сантехники не добавлены</p>
            </div>
          )}

          <div className="mt-12 pt-8 border-t dark:border-gray-700">
            <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-8 tracking-tight">Назначение исполнителей на заявки</h4>
            <div className="space-y-4">
              {applications
                .filter(a => a.status !== 'archived')
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(app => {
                  const user = users.find(u => u.id === app.userId);
                  const assignedPlumber = plumbers.find(p => p.id === app.plumberId);
                  return (
                    <div key={app.id} className={`p-6 rounded-2xl border-2 transition-all ${app.plumberId ? 'border-green-200 bg-green-50/3' : 'border-amber-200 bg-amber-50/3'}`}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-black text-gray-900 dark:text-white text-sm">
                            {app.serviceType === 'verification' ? '🔍 Поверка счетчика' : app.serviceType === 'replacement' ? '🔧 Замена счетчика' : '💧 Подвоз воды'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{user?.fullName} • {user?.address}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1">
                            Заявка №{app.id} • {new Date(app.createdAt).toLocaleDateString()} • {new Date(app.preferredDateTime).toLocaleDateString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {assignedPlumber ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 rounded-xl">
                              <i className="fas fa-check text-green-600"></i>
                              <div>
                                <p className="font-black text-xs text-green-700 dark:text-green-400">{assignedPlumber.fullName}</p>
                                <p className="text-[9px] text-green-600/70">{assignedPlumber.phone}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-600">Не назначен</span>
                          )}
                          <button 
                            onClick={() => setAssigningApplicationId(app.id)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all"
                          >
                            Назначить
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden p-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Новости</h3>
            <button 
              onClick={() => setEditingNews({ id: '', type: 'info', title: '', content: '', settlement: 'г. Питкяранта', createdAt: new Date().toISOString() })}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
            >+ Создать</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map(item => (
              <div key={item.id} className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${item.type === 'emergency' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>{item.type}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingNews(item)} className="text-blue-500 hover:text-blue-600"><i className="fas fa-edit"></i></button>
                    <button onClick={() => onUpdateNews(news.filter(n => n.id !== item.id))} className="text-red-500 hover:text-red-600"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
                <h4 className="font-black text-gray-900 dark:text-white mb-2">{item.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden p-8 animate-in fade-in duration-500">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-8 text-left tracking-tight">Обратная связь</h3>
          <div className="space-y-6">
            {feedbacks.length === 0 ? <p className="text-gray-400 italic text-center py-10">Сообщений нет</p> : feedbacks.map(f => {
              const u = users.find(user => user.id === f.userId);
              return (
                <div key={f.id} className={`p-8 rounded-[2rem] border transition-all text-left ${f.isRead ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800' : 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 ring-2 ring-primary-500/20'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 border overflow-hidden shadow-sm">
                          <AvatarImage user={u || { id: '', fullName: '?', isLegalEntity: false, settlement: '', address: '', phone: '', email: '', isAdmin: false, accountNumber: '' }} className="w-full h-full" />
                       </div>
                       <div>
                          <p className="font-black text-gray-900 dark:text-white">{u?.fullName || 'Удаленный абонент'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(f.createdAt).toLocaleString()}</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       {!f.adminReply && (
                         <button onClick={() => onUpdateFeedbacks(prev => prev.map(item => item.id === f.id ? {...item, isRead: !item.isRead} : item))} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${f.isRead ? 'bg-gray-100 text-gray-400' : 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'}`} title="Пометить как прочитанное"><i className="fas fa-check"></i></button>
                       )}
                       <button onClick={() => { if(confirm('Удалить отзыв безвозвратно?')) onUpdateFeedbacks(prev => prev.filter(item => item.id !== f.id)) }} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                  
                  <div className="pl-16 mb-6">
                    <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm italic text-sm text-gray-700 dark:text-gray-300">
                      "{f.text}"
                    </div>
                  </div>

                  {f.adminReply ? (
                    <div className="pl-16 mt-4">
                       <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                          <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                            <i className="fas fa-reply"></i> Ваш ответ
                          </div>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{f.adminReply}</p>
                          <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase">{new Date(f.repliedAt!).toLocaleString()}</p>
                       </div>
                    </div>
                  ) : (
                    <div className="pl-16 space-y-3">
                      <textarea 
                        value={replyTexts[f.id] || ''}
                        onChange={(e) => setReplyTexts({...replyTexts, [f.id]: e.target.value})}
                        placeholder="Введите ответ абоненту..."
                        className="w-full p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium outline-none focus:border-primary-500 transition-colors resize-none h-24"
                      />
                      <button 
                        onClick={() => handleSendFeedbackReply(f.id)}
                        disabled={!replyTexts[f.id]?.trim()}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        <i className="fas fa-paper-plane"></i> Ответить
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
           <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col">
              <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-6 tracking-tight">Реестр показаний (CSV)</h4>
              <div className="space-y-4 mb-10">
                 <div className="grid grid-cols-3 gap-2">
                    {['day', 'month', 'all'].map(t => (
                      <button key={t} onClick={() => setCsvPeriodType(t as any)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${csvPeriodType === t ? 'bg-primary-600 border-primary-600 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 text-gray-500'}`}>{t === 'day' ? 'День' : t === 'month' ? 'Месяц' : 'Все'}</button>
                    ))}
                 </div>
                 {csvPeriodType === 'day' && <input type="date" value={csvDate} onChange={e => setCsvDate(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border rounded-xl font-bold dark:text-white outline-none" />}
                 {csvPeriodType === 'month' && <input type="month" value={csvMonth} onChange={e => setCsvMonth(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border rounded-xl font-bold dark:text-white outline-none" />}
                 <button 
                  onClick={() => {
                    const header = 'Дата;Л/С;ФИО;Поселение;Адрес;ХВС №1;ГВС №1;ХВС №2;ГВС №2\n';
                    const data = readings.filter(r => csvPeriodType === 'all' || r.submissionDate.startsWith(csvPeriodType === 'day' ? csvDate : csvMonth)).map(r => {
                      const u = users.find(user => user.id === r.userId);
                      return `${new Date(r.submissionDate).toLocaleDateString()};${u?.accountNumber};${u?.fullName};${u?.settlement};${u?.address};${r.coldWater};${r.hotWater};${r.coldWater2 || '—'};${r.hotWater2 || '—'}`;
                    }).join('\n');
                    const blob = new Blob(['\uFEFF' + header + data], { type: 'text/csv;charset=utf-8;' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Показания_${stats.label}.csv`;
                    link.click();
                  }}
                  className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-primary-700 transition-all"
                 >Скачать CSV Выгрузку</button>
              </div>

              <div className="mt-auto border-t dark:border-gray-700 pt-8">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Системные настройки</h4>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex items-center justify-between group transition-all hover:border-indigo-200">
                   <div className="flex items-center gap-4 text-left">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${isEducationEnabled ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                        <i className="fas fa-graduation-cap"></i>
                      </div>
                      <div>
                        <p className="font-black text-gray-900 dark:text-white text-sm">Обучающий режим</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Интерактивный гид для жителей</p>
                      </div>
                   </div>
                   <button 
                    onClick={toggleEducationWithReset}
                    className={`w-14 h-8 rounded-full transition-all relative ${isEducationEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                   >
                     <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${isEducationEnabled ? 'right-1' : 'left-1'}`}></div>
                   </button>
                </div>
              </div>
           </div>

           <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 p-8">
              <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-6 tracking-tight">Аналитика для руководства</h4>
              <div className="space-y-4">
                 <div className="grid grid-cols-3 gap-2">
                    {['day', 'month', 'all'].map(t => (
                      <button key={t} onClick={() => setStatsPeriodType(t as any)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${statsPeriodType === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 text-gray-500'}`}>{t === 'day' ? 'День' : t === 'month' ? 'Месяц' : 'Все'}</button>
                    ))}
                 </div>
                 {statsPeriodType === 'day' && <input type="date" value={statsDate} onChange={e => setStatsDate(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border rounded-xl font-bold dark:text-white outline-none" />}
                 {statsPeriodType === 'month' && <input type="month" value={statsMonth} onChange={e => setStatsMonth(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border rounded-xl font-bold dark:text-white outline-none" />}
                 <button 
                  onClick={handleDownloadExecutiveReport}
                  disabled={isGeneratingPdf}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all"
                 >
                   {isGeneratingPdf ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-file-pdf"></i>}
                   Сформировать PDF отчет
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* ШАБЛОН АНАЛИТИЧЕСКОГО ОТЧЕТА (Скрытый в DOM для захвата) */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div 
          ref={executiveReportRef}
          style={{ 
            width: '210mm', 
            height: '297mm', 
            padding: '20mm', 
            backgroundColor: '#fff', 
            fontFamily: 'Arial, Helvetica, sans-serif',
            color: '#000000',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2.5px solid #000000', paddingBottom: '12px' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#0ea5e9', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <i className="fas fa-faucet-drip" style={{ color: '#ffffff', fontSize: '32px' }}></i>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h1 style={{ fontSize: '15px', fontWeight: '900', margin: '0', textTransform: 'uppercase', color: '#000000' }}>МКУ ПМО "Хозяйственное управление"</h1>
              <p style={{ fontSize: '11px', margin: '5px 0 0', fontWeight: '700', color: '#000000' }}>Аналитическая служба ИС "Питкяранта-Вода"</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 12px 0', textTransform: 'uppercase', color: '#000000', letterSpacing: '0.5px' }}>Аналитическая справка</h2>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#333333' }}>Отчетный период: {stats.label}</p>
          </div>

          {/* Key Metrics Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '45px' }}>
            <div style={{ padding: '22px', border: '1.5px solid #d1d5db', borderRadius: '18px', backgroundColor: '#fdfdfd' }}>
               <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#666666', textTransform: 'uppercase', marginBottom: '18px', borderBottom: '1px solid #eeeeee', paddingBottom: '6px' }}>Абонентская база</h3>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                 <span style={{ fontSize: '13px', fontWeight: '700', color: '#000000' }}>Всего абонентов:</span>
                 <span style={{ fontSize: '14px', fontWeight: '900', color: '#000000' }}>{stats.totalUsers}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                 <span style={{ fontSize: '13px', fontWeight: '700', color: '#000000' }}>Юридические лица (ЮЛ/ИП):</span>
                 <span style={{ fontSize: '14px', fontWeight: '900', color: '#000000' }}>{stats.legalUsers}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ fontSize: '13px', fontWeight: '700', color: '#000000' }}>Активных Личных Кабинетов:</span>
                 <span style={{ fontSize: '14px', fontWeight: '900', color: '#000000' }}>{stats.activeUsers}</span>
               </div>
            </div>
            <div style={{ padding: '22px', border: '1.5px solid #d1d5db', borderRadius: '18px', backgroundColor: '#fdfdfd' }}>
               <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#666666', textTransform: 'uppercase', marginBottom: '18px', borderBottom: '1px solid #eeeeee', paddingBottom: '6px' }}>Передача показаний</h3>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                 <span style={{ fontSize: '13px', fontWeight: '700', color: '#000000' }}>Уникальных абонентов за период:</span>
                 <span style={{ fontSize: '14px', fontWeight: '900', color: '#000000' }}>{stats.uniqueUsersReadings}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ fontSize: '13px', fontWeight: '700', color: '#000000' }}>Охват приборами учета:</span>
                 <span style={{ fontSize: '16px', fontWeight: '900', color: '#0369a1' }}>{stats.coveragePercent}%</span>
               </div>
            </div>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '18px', textTransform: 'uppercase', borderLeft: '5px solid #0ea5e9', paddingLeft: '12px', color: '#000000' }}>СЕРВИСНЫЕ ЗАЯВКИ</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '50px', border: '1.5px solid #000000' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '15px 12px', textAlign: 'left', border: '1.5px solid #000000', fontSize: '12px', color: '#000000', fontWeight: '900', textTransform: 'uppercase' }}>Наименование услуги</th>
                <th style={{ padding: '15px 12px', textAlign: 'center', border: '1.5px solid #000000', fontSize: '12px', color: '#000000', fontWeight: '900', textTransform: 'uppercase', width: '100px' }}>Кол-во</th>
                <th style={{ padding: '15px 12px', textAlign: 'right', border: '1.5px solid #000000', fontSize: '12px', color: '#000000', fontWeight: '900', textTransform: 'uppercase' }}>Примечание</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '15px 12px', border: '1.5px solid #000000', fontSize: '13px', fontWeight: '700', color: '#000000' }}>Поверка приборов учета</td>
                <td style={{ padding: '15px 12px', textAlign: 'center', border: '1.5px solid #000000', fontSize: '15px', fontWeight: '900', color: '#000000' }}>{stats.verification}</td>
                <td style={{ padding: '15px 12px', textAlign: 'right', border: '1.5px solid #000000', fontSize: '11px', color: '#333333', fontStyle: 'italic' }}>Выезды специалистов</td>
              </tr>
              <tr>
                <td style={{ padding: '15px 12px', border: '1.5px solid #000000', fontSize: '13px', fontWeight: '700', color: '#000000' }}>Замена оборудования</td>
                <td style={{ padding: '15px 12px', textAlign: 'center', border: '1.5px solid #000000', fontSize: '15px', fontWeight: '900', color: '#000000' }}>{stats.replacement}</td>
                <td style={{ padding: '15px 12px', textAlign: 'right', border: '1.5px solid #000000', fontSize: '11px', color: '#333333', fontStyle: 'italic' }}>Технические работы</td>
              </tr>
              <tr>
                <td style={{ padding: '15px 12px', border: '1.5px solid #000000', fontSize: '13px', fontWeight: '700', color: '#000000' }}>Подвоз питьевой воды</td>
                <td style={{ padding: '15px 12px', textAlign: 'center', border: '1.5px solid #000000', fontSize: '15px', fontWeight: '900', color: '#000000' }}>{stats.delivery}</td>
                <td style={{ padding: '15px 12px', textAlign: 'right', border: '1.5px solid #000000', fontSize: '14px', fontWeight: '900', color: '#0369a1' }}>{stats.volume.toFixed(2)} м³</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: 'auto', paddingTop: '70px', display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000000' }}>
             <div style={{ width: '45%' }}>
               <p style={{ fontSize: '11px', fontWeight: '900', color: '#444444', textTransform: 'uppercase', marginBottom: '35px' }}>Ответственный специалист</p>
               <div style={{ borderBottom: '1.5px solid #000000' }}></div>
             </div>
             <div style={{ width: '45%', position: 'relative' }}>
               <p style={{ fontSize: '11px', fontWeight: '900', color: '#444444', textTransform: 'uppercase', marginBottom: '35px' }}>Директор МКУ ПМО</p>
               <div style={{ borderBottom: '1.5px solid #000000' }}></div>
               
               {/* Stamp Placeholder */}
               <div style={{ 
                 position: 'absolute', top: '5px', right: '25px', width: '135px', height: '135px', 
                 border: '2.5px double rgba(0,0,255,0.35)', borderRadius: '50%', display: 'flex', alignItems: 'center', 
                 justifyContent: 'center', color: 'rgba(0,0,255,0.4)', fontSize: '9px', fontWeight: '900', 
                 textAlign: 'center', transform: 'rotate(-12deg)', pointerEvents: 'none', lineHeight: '1.2'
               }}>
                  МКУ ПМО<br/>ХОЗУПРАВЛЕНИЕ<br/>ПИТКЯРАНТА
               </div>
             </div>
          </div>
          
          <div style={{ position: 'absolute', bottom: '15mm', left: '20mm', fontSize: '10px', color: '#666666', fontWeight: '700' }}>
            Документ сформирован автоматически в ИС Питкяранта-Вода: {new Date().toLocaleString('ru-RU')}
          </div>
        </div>
      </div>

      {viewingReadingsUser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[250] p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in duration-300 my-auto text-left">
            <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight">Показания абонента</h4>
                <p className="text-xs font-bold opacity-80 mt-1">{viewingReadingsUser.fullName} (Л/С: {viewingReadingsUser.accountNumber})</p>
              </div>
              <button onClick={() => setViewingReadingsUser(null)} className="w-10 h-10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><i className="fas fa-times text-xl"></i></button>
            </div>
            
            <div className="p-8">
               <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800 mb-8">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">Добавить запись вручную</h5>
                  <form onSubmit={handleAddReadingAdmin} className={`grid gap-4 ${viewingReadingsUser.hasDualMeters ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
                     <input type="number" step="0.01" value={newReadingCold} onChange={e => setNewReadingCold(e.target.value)} placeholder="ХВС №1" className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold dark:text-white outline-none" required />
                     <input type="number" step="0.01" value={newReadingHot} onChange={e => setNewReadingHot(e.target.value)} placeholder="ГВС №1" className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold dark:text-white outline-none" required />
                     {viewingReadingsUser.hasDualMeters && (
                       <>
                         <input type="number" step="0.01" value={newReadingCold2} onChange={e => setNewReadingCold2(e.target.value)} placeholder="ХВС №2" className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-blue-300 rounded-xl font-bold dark:text-white outline-none" required />
                         <input type="number" step="0.01" value={newReadingHot2} onChange={e => setNewReadingHot2(e.target.value)} placeholder="ГВС №2" className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-blue-300 rounded-xl font-bold dark:text-white outline-none" required />
                       </>
                     )}
                     <button type="submit" className={`${viewingReadingsUser.hasDualMeters ? 'col-span-2 md:col-span-4' : 'col-span-2 md:col-span-1'} bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-blue-700 transition-all`}>Добавить</button>
                  </form>
               </div>

               <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">История показаний</h5>
               <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {readings.filter(r => r.userId === viewingReadingsUser.id).sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()).map(r => (
                    <div key={r.id} className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex justify-between items-center group">
                       <div className="flex items-center gap-6">
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Дата</p>
                            <p className="text-xs font-black text-gray-900 dark:text-white">{new Date(r.submissionDate).toLocaleString()}</p>
                          </div>
                          <div className="flex gap-4">
                             <div className="text-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                                <span className="text-[8px] font-black text-blue-600 uppercase block">ХВС №1</span>
                                <span className="text-xs font-black text-blue-700 dark:text-blue-400">{r.coldWater.toFixed(2)}</span>
                             </div>
                             <div className="text-center bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-lg">
                                <span className="text-[8px] font-black text-red-600 uppercase block">ГВС №1</span>
                                <span className="text-xs font-black text-red-700 dark:text-red-400">{r.hotWater.toFixed(2)}</span>
                             </div>
                             {viewingReadingsUser.hasDualMeters && (
                               <>
                                 <div className="text-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-300 dark:border-blue-700">
                                    <span className="text-[8px] font-black text-blue-600 uppercase block">ХВС №2</span>
                                    <span className="text-xs font-black text-blue-700 dark:text-blue-400">{(r.coldWater2 || 0).toFixed(2)}</span>
                                 </div>
                                 <div className="text-center bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-lg border border-red-300 dark:border-red-700">
                                    <span className="text-[8px] font-black text-red-600 uppercase block">ГВС №2</span>
                                    <span className="text-xs font-black text-red-700 dark:text-red-400">{(r.hotWater2 || 0).toFixed(2)}</span>
                                 </div>
                               </>
                             )}
                          </div>
                       </div>
                       <button onClick={() => { if(confirm('Удалить эти показания?')) onUpdateReadings(prev => prev.filter(item => item.id !== r.id)) }} className="w-9 h-9 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                          <i className="fas fa-trash-alt"></i>
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-auto text-left">
            <div className="p-8 bg-primary-600 text-white flex justify-between items-center">
              <h4 className="text-xl font-black uppercase tracking-tight">{editingUser.id ? 'Редактирование профиля' : 'Новый абонент'}</h4>
              <button onClick={() => setEditingUser(null)} className="w-10 h-10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleSaveUser} className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Лицевой счет</label>
                    <input type="text" value={editingUser.accountNumber} onChange={e => setEditingUser({...editingUser, accountNumber: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-primary-500 rounded-xl font-bold dark:text-white outline-none" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Пароль</label>
                    <input type="text" value={editingUser.password || ''} onChange={e => setEditingUser({...editingUser, password: e.target.value})} className="w-full p-4 bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-200 dark:border-yellow-700/30 rounded-xl font-mono font-bold dark:text-white outline-none" placeholder="Первый вход..." />
                  </div>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ФИО / Наименование</label>
                 <input type="text" value={editingUser.fullName} onChange={e => setEditingUser({...editingUser, fullName: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-primary-500 rounded-xl font-bold dark:text-white outline-none" required />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Телефон</label>
                    <input type="tel" value={editingUser.phone} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-primary-500 rounded-xl font-bold dark:text-white outline-none" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Поселение</label>
                    <select value={editingUser.settlement} onChange={e => setEditingUser({...editingUser, settlement: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-primary-500 rounded-xl font-bold dark:text-white outline-none">
                      {PITKYARANTA_SETTLEMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Адрес (ул, дом, кв)</label>
                 <input type="text" value={editingUser.address} onChange={e => setEditingUser({...editingUser, address: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-primary-500 rounded-xl font-bold dark:text-white outline-none" required />
               </div>
               <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700/30">
                 <input 
                   type="checkbox" 
                   id="dualMeters" 
                   checked={editingUser.hasDualMeters || false}
                   onChange={e => setEditingUser({...editingUser, hasDualMeters: e.target.checked})}
                   className="w-5 h-5 accent-primary-600 cursor-pointer"
                 />
                 <label htmlFor="dualMeters" className="flex-1 text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide cursor-pointer">
                   <i className="fas fa-tachometer-alt mr-2 text-primary-600"></i>По 2 счетчика ХВС и ГВС
                 </label>
               </div>
               <button type="submit" className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-primary-700 transition-all">Сохранить данные</button>
            </form>
          </div>
        </div>
      )}

      {editingNews && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 text-left">
            <div className="p-8 bg-primary-600 text-white flex justify-between items-center">
              <h4 className="text-xl font-black uppercase tracking-tight">{editingNews.id ? 'Редактировать новость' : 'Новое объявление'}</h4>
              <button onClick={() => setEditingNews(null)} className="w-10 h-10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleSaveNews} className="p-8 space-y-6">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Заголовок</label>
                 <input type="text" value={editingNews.title} onChange={e => setEditingNews({...editingNews, title: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border rounded-xl font-bold dark:text-white outline-none" required />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Тип</label>
                    <select value={editingNews.type} onChange={e => setEditingNews({...editingNews, type: e.target.value as NewsType})} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border rounded-xl font-bold dark:text-white outline-none">
                       <option value="info">Информация</option>
                       <option value="emergency">Авария</option>
                       <option value="planned">Плановые работы</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Поселение</label>
                    <select value={editingNews.settlement} onChange={e => setEditingNews({...editingNews, settlement: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border rounded-xl font-bold dark:text-white outline-none">
                      {PITKYARANTA_SETTLEMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Содержание</label>
                 <textarea value={editingNews.content} onChange={e => setEditingNews({...editingNews, content: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border rounded-xl font-bold dark:text-white min-h-[100px] resize-none outline-none" required />
               </div>
               <button type="submit" className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-primary-700 transition-all">Опубликовать</button>
            </form>
          </div>
        </div>
      )}

      {viewingApplication && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[300] p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in duration-300 text-left">
             <div className={`p-8 flex justify-between items-center text-white ${viewingApplication.status === 'pending' ? 'bg-amber-500' : viewingApplication.status === 'in_progress' ? 'bg-blue-600' : viewingApplication.status === 'completed' ? 'bg-green-600' : 'bg-gray-700'}`}>
                <div>
                   <h4 className="text-xl font-black uppercase tracking-tight">Заявка №{viewingApplication.id}</h4>
                   <p className="text-xs font-black uppercase opacity-70 mt-1">Статус: {getStatusLabel(viewingApplication.status)}</p>
                </div>
                <button onClick={() => setViewingApplication(null)} className="w-10 h-10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><i className="fas fa-times text-xl"></i></button>
             </div>
             
             <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Тип услуги</span><p className="font-black text-gray-900 dark:text-white uppercase">{viewingApplication.serviceType === 'water_delivery' ? 'Подвоз воды' : 'Сервис счетчика'}</p></div>
                      <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Объект/Прибор</span><p className="font-bold text-gray-700 dark:text-gray-300 italic">{viewingApplication.meterType || (viewingApplication.deliveryVolume + ' м³')}</p></div>
                      <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Время визита</span><p className="font-black text-gray-900 dark:text-white">{new Date(viewingApplication.preferredDateTime).toLocaleString()}</p></div>
                   </div>
                   <div className="space-y-4">
                      <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Абонент</span><p className="font-black text-gray-900 dark:text-white">{users.find(u => u.id === viewingApplication.userId)?.fullName}</p></div>
                      <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Контакты</span><p className="font-bold text-primary-600">{viewingApplication.contactPhone}</p></div>
                      <div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Адрес</span><p className="font-bold text-gray-700 dark:text-gray-300">{viewingApplication.deliveryAddress || users.find(u => u.id === viewingApplication.userId)?.address}</p></div>
                   </div>
                </div>

                {/* Блок назначения исполнителя */}
                <div className="pt-6 border-t dark:border-gray-700">
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <i className="fas fa-wrench"></i> Назначенный исполнитель
                    </p>
                    {viewingApplication.plumberId ? (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800 flex items-center justify-between">
                        <div>
                          <p className="font-black text-green-700 dark:text-green-400">{plumbers.find(p => p.id === viewingApplication.plumberId)?.fullName || 'Неизвестный сантехник'}</p>
                          <p className="text-[10px] font-bold text-green-600/70 mt-1">{plumbers.find(p => p.id === viewingApplication.plumberId)?.phone}</p>
                          <p className="text-[9px] text-green-600/50 mt-1">Назначен: {viewingApplication.assignedAt ? new Date(viewingApplication.assignedAt).toLocaleString() : '---'}</p>
                        </div>
                        <button
                          onClick={() => setAssigningApplicationId(viewingApplication.id)}
                          className="px-3 py-1.5 bg-green-600 text-white text-[9px] font-black rounded-lg hover:bg-green-700 transition-all"
                        >
                          Изменить
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAssigningApplicationId(viewingApplication.id)}
                        className="w-full p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl text-amber-700 dark:text-amber-400 font-black text-sm uppercase tracking-widest hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all"
                      >
                        <i className="fas fa-plus mr-2"></i> Назначить исполнителя
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t dark:border-gray-800 space-y-3">
                   {viewingApplication.status === 'pending' && (
                     <button 
                      onClick={() => { onUpdateApplicationStatus(viewingApplication.id, 'in_progress'); setViewingApplication({...viewingApplication, status: 'in_progress'}); }}
                      className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                     >
                       <i className="fas fa-play"></i> Взять в работу
                     </button>
                   )}
                   {viewingApplication.status === 'in_progress' && (
                     <button 
                      onClick={() => { onUpdateApplicationStatus(viewingApplication.id, 'completed'); setViewingApplication({...viewingApplication, status: 'completed'}); }}
                      className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-green-700 transition-all flex items-center justify-center gap-3"
                     >
                       <i className="fas fa-check-double"></i> Выполнить заявку
                     </button>
                   )}
                   {viewingApplication.status === 'completed' && (
                     <button 
                      onClick={() => { onUpdateApplicationStatus(viewingApplication.id, 'archived'); setViewingApplication(null); }}
                      className="w-full py-5 bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                     >
                       <i className="fas fa-archive"></i> Переместить в архив
                     </button>
                   )}
                   <button 
                    onClick={() => setViewingApplication(null)}
                    className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-gray-200"
                   >
                     Закрыть
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {editingPlumber && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-auto text-left">
            <div className="p-8 bg-primary-600 text-white flex justify-between items-center">
              <h4 className="text-xl font-black uppercase tracking-tight">{editingPlumber.id ? 'Редактирование профиля' : 'Новый сантехник'}</h4>
              <button onClick={() => setEditingPlumber(null)} className="w-10 h-10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleSavePlumber} className="p-8 space-y-6">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ФИО</label>
                 <input type="text" value={editingPlumber.fullName} onChange={e => setEditingPlumber({...editingPlumber, fullName: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-primary-500 rounded-xl font-bold dark:text-white outline-none" placeholder="Иван Иванов" required />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Телефон</label>
                 <input type="tel" value={editingPlumber.phone} onChange={e => setEditingPlumber({...editingPlumber, phone: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-primary-500 rounded-xl font-bold dark:text-white outline-none" placeholder="+7 921 123-45-67" required />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email (опционально)</label>
                 <input type="email" value={editingPlumber.email || ''} onChange={e => setEditingPlumber({...editingPlumber, email: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-primary-500 rounded-xl font-bold dark:text-white outline-none" placeholder="ivan@example.com" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Специализация</label>
                 <select value={editingPlumber.specialization} onChange={e => setEditingPlumber({...editingPlumber, specialization: e.target.value as any})} className="w-full p-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-primary-500 rounded-xl font-bold dark:text-white outline-none">
                   <option value="verification">Поверка счетчиков</option>
                   <option value="replacement">Замена счетчиков</option>
                   <option value="general">Универсальный специалист</option>
                 </select>
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={editingPlumber.isActive} 
                     onChange={e => setEditingPlumber({...editingPlumber, isActive: e.target.checked})}
                     className="w-4 h-4 rounded-md"
                   />
                   Активен (может получать заявки)
                 </label>
               </div>
               <button type="submit" className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-primary-700 transition-all">Сохранить</button>
            </form>
          </div>
        </div>
      )}

      {assigningApplicationId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[500] p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 text-left my-auto">
            <div className="p-8 bg-primary-600 text-white flex justify-between items-center">
              <h4 className="text-xl font-black uppercase tracking-tight">Выбрать исполнителя</h4>
              <button onClick={() => setAssigningApplicationId(null)} className="w-10 h-10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"><i className="fas fa-times text-xl"></i></button>
            </div>
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {plumbers.filter(p => p.isActive).map(plumber => (
                <button
                  key={plumber.id}
                  onClick={() => handleAssignPlumber(assigningApplicationId, plumber.id)}
                  className="w-full p-6 text-left bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">{plumber.fullName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        {plumber.specialization === 'verification' ? 'Поверка' : plumber.specialization === 'replacement' ? 'Замена' : 'Универсал'}
                      </p>
                      <p className="text-xs text-primary-600 font-bold mt-2">{plumber.phone}</p>
                    </div>
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </button>
              ))}
              {plumbers.filter(p => p.isActive).length === 0 && (
                <p className="text-center text-gray-400 italic py-8">Нет активных сантехников</p>
              )}
            </div>
            <div className="p-8 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setAssigningApplicationId(null)}
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-gray-200"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(0.99); }
        }
        .animate-pulse-subtle { animation: pulse-subtle 3s infinite ease-in-out; }
        
        /* Иконка календаря для темной темы */
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="month"]::-webkit-calendar-picker-indicator {
          filter: invert(0.8) brightness(1.2);
          cursor: pointer;
        }
        
        .dark input[type="date"]::-webkit-calendar-picker-indicator,
        .dark input[type="month"]::-webkit-calendar-picker-indicator {
          filter: invert(0.9) brightness(1.3);
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
