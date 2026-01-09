
import React, { useState, useRef, useEffect } from 'react';
import { chatWithKonstantin } from '../services/gemini';
import { ChatMessage } from '../types';
import { OFFLINE_TEMPLATES, ORG_INFO } from '../constants';
import { findKnowledgeAnswer } from '../services/knowledgeBase';

const QUICK_QUESTIONS = [
  "Как передать показания счётчика?",
  "Какие текущие тарифы на воду?",
  "Как оплатить услугу?",
  "Какой срок передачи показаний?",
  "Как связаться с диспетчерской?"
];

const KONSTANTIN_AVATAR = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&h=150&auto=format&fit=crop';
const KONSTANTIN_FALLBACK = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMzc0MUZGIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI4NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPks8L3RleHQ+Cjwvc3ZnPg==';

const AvatarImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = '' }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (src === KONSTANTIN_AVATAR) {
        setImgSrc(KONSTANTIN_FALLBACK);
      } else {
        // Для других изображений показываем инициалы
        setImgSrc('');
      }
    }
  };

  if (!imgSrc || hasError) {
    return (
      <div className={`bg-primary-600 flex items-center justify-center text-white font-bold ${className}`}>
        {alt === 'K' || alt === 'Konstantin' ? 'К' : alt.charAt(0)}
      </div>
    );
  }

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Здравствуйте! Я Константин, ваш помощник. Чем я могу вам помочь сегодня?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const getRandomResponse = (responses: string[]): string => {
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const findInstantResponse = (text: string): string | null => {
    const t = text.toLowerCase();
    
    // СНАЧАЛА проверяем базу знаний (самые структурированные ответы)
    const knowledgeAnswer = findKnowledgeAnswer(text);
    if (knowledgeAnswer) {
      return knowledgeAnswer;
    }
    
    // Затем проверяем аварийные ситуации - НАИВЫСШИЙ ПРИОРИТЕТ
    if (/авари|протечк|затопил|нет воды|прорв|течет|срочн|помощь|скорая|нет.*воды|вода.*отключ/.test(t)) {
      return getRandomResponse(OFFLINE_TEMPLATES.emergency);
    }
    
    // Приветствия
    if (/привет|здравствуй|добрый|доброе|добрая|hello|hi|как дела|как ты|что новое|с добрым|доброго|салют/.test(t)) {
      return getRandomResponse(OFFLINE_TEMPLATES.greetings);
    }
    
    // Благодарность
    if (/спасибо|благодар|пасиб|thanks|thx|спс|дякую|мерси|огромное.*спасибо|большое.*спасибо|спасибо.*большое/.test(t)) {
      return getRandomResponse(OFFLINE_TEMPLATES.thanks);
    }
    
    // Прощание
    if (/пока|до свидани|прощай|до встреч|увидимся|пока-пока|сега|ухожу|конец|выход|закрыв|пока-пока/.test(t)) {
      return getRandomResponse(OFFLINE_TEMPLATES.farewells);
    }
    
    // Информация о боте
    if (/кто ты|как тебя зовут|твоё имя|представься|кто такой|что ты|я константин|создатель|тебя зовут|константин/.test(t)) {
      return getRandomResponse(OFFLINE_TEMPLATES.identity);
    }
    
    // Вопросы о счете и квитанциях
    if (/счет|квитанци|расчет|сумма.*долга|задолжен|сколько.*долга|история.*платежей/.test(t)) {
      return "Всю информацию о своем счете, платежах и истории можно увидеть в личном кабинете в разделе 'Оплата и счета'. Квитанции хранятся там же. Если вопрос не решен, звоните " + ORG_INFO.phone + ".";
    }
    
    // Вопросы о документах и справках
    if (/справк|документ|выписк|копи|оригинал|подтвержд|предостави/.test(t)) {
      return "Справки и документы об оплате можно получить в офисе по адресу " + ORG_INFO.address + " или через личный кабинет. Рабочее время: ПН-ПТ 08:30-17:30 (обед 13:00-14:00). Звоните: " + ORG_INFO.phone + ".";
    }
    
    // Вопросы о нормативах и правилах
    if (/норматив|правил|поверка.*счетчик|акт.*поверк|срок.*действи/.test(t)) {
      return "Поверка счетчика требуется каждые 4 года. Мы организуем приезд мастера - заявку можно подать в личном кабинете или по телефону " + ORG_INFO.phone + ". Все нормативы соответствуют действующему законодательству.";
    }
    
    // Рекомендация попробовать конкретные вопросы
    if (/помощь|что.*можешь|на.*что.*отвечаешь|что.*знаешь|что.*я.*умею/.test(t)) {
      return "Я помогу вам с информацией о:\n• Передаче показаний счетчика\n• Тарифах и ценах\n• Способах оплаты\n• Сроках и периодах\n• Контактных данных\n• Адресе и времени работы\n• Доступных услугах\n\nЧто вас интересует?";
    }
    
    // Если ничего не подошло - вернуть случайный fallback ответ
    return getRandomResponse(OFFLINE_TEMPLATES.fallback);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const instantResponse = findInstantResponse(textToSend);
    if (instantResponse) {
      setIsLoading(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: instantResponse }]);
        setIsLoading(false);
      }, 400);
      return;
    }

    if (!isOnline) {
      setIsLoading(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: "Вы в офлайне. Я могу помочь с информацией. Для подробного ответа позвоните " + ORG_INFO.phone }]);
        setIsLoading(false);
      }, 400);
      return;
    }

    setIsLoading(true);
    try {
      const response = await chatWithKonstantin([...messages, userMessage]);
      if (response && response.trim()) {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Позвоните на номер " + OFFLINE_TEMPLATES.phone }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Ошибка соединения. " + OFFLINE_TEMPLATES.phone }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 w-80 sm:w-96 h-[550px] shadow-2xl rounded-2xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden mb-4 transition-all animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-primary-600 p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-primary-500/30">
                <AvatarImage src={KONSTANTIN_AVATAR} alt="Konstantin" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-semibold block leading-none text-white">Константин</span>
                <div className="flex items-center gap-1.5 mt-1">
                   <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                   <span className="text-[9px] opacity-80 uppercase tracking-widest text-white">
                     {isOnline ? 'В сети' : 'Офлайн-режим'}
                   </span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200 p-1 text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 mt-auto mb-1 shrink-0 border border-gray-200 dark:border-gray-600">
                    <AvatarImage src={KONSTANTIN_AVATAR} alt="K" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${
                  m.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-600'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full overflow-hidden mr-2 mt-auto mb-1 shrink-0 border border-gray-200 dark:border-gray-600">
                  <AvatarImage src={KONSTANTIN_AVATAR} alt="K" className="w-full h-full object-cover opacity-50" />
                </div>
                <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
            {!isLoading && messages.length < 15 && (
              <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div className="flex space-x-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isOnline ? "Напишите сообщение..." : "Задайте базовый вопрос..."}
                className="flex-1 bg-gray-100 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder:text-gray-400"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="bg-primary-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-primary-500/20"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="chatbot-trigger" className="relative group scroll-mt-24">
        {!isOpen && (
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-gray-900/90 dark:bg-gray-100/90 backdrop-blur-md text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none shadow-2xl border border-white/10 dark:border-black/5 z-[60]">
            {isOnline ? 'Задать вопрос помощнику' : 'Справочная служба (офлайн)'}
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-gray-900/90 dark:border-l-gray-100/90"></div>
          </div>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative overflow-hidden ${isOnline ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-600 hover:bg-gray-700'}`}
        >
          <div className="absolute inset-0 bg-primary-700 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          {isOpen ? (
            <i className="fas fa-chevron-down text-2xl text-white"></i>
          ) : (
            <div className="w-full h-full p-1 relative">
               <AvatarImage src={KONSTANTIN_AVATAR} alt="K" className={`w-full h-full object-cover rounded-xl ${isOnline ? '' : 'grayscale'}`} />
               <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-primary-600 animate-pulse ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
               {!isOnline && <i className="fas fa-wifi-slash absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xl drop-shadow-md"></i>}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
