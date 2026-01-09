
import React, { useEffect } from 'react';
import { DEVELOPER_INFO } from '../constants';

const DeveloperPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-950 py-20 min-h-[60vh] flex items-center justify-center animate-in fade-in duration-700">
      <div className="max-w-3xl w-full px-6">
        <div className="relative group">
          {/* Декоративное свечение */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-blue-500 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[3rem] p-10 md:p-16 shadow-2xl text-center">
            <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-3xl flex items-center justify-center text-primary-600 dark:text-primary-400 text-4xl mx-auto mb-8 shadow-inner border border-primary-100 dark:border-primary-800">
              <i className="fas fa-code"></i>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              {DEVELOPER_INFO.name}
            </h1>
            
            <div className="inline-block px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-full text-[10px] font-black uppercase tracking-widest text-primary-600 mb-10 border border-gray-100 dark:border-gray-700">
              {DEVELOPER_INFO.roles}
            </div>

            <p className="text-gray-500 dark:text-gray-400 font-medium mb-12 max-w-md mx-auto leading-relaxed">
              Этот портал создан для того, чтобы сделать жизнь жителей Питкярантского округа проще и удобнее. По вопросам сотрудничества и поддержки пишите по контактам ниже.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <a 
                href={DEVELOPER_INFO.telegramLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 hover:scale-105 transition-all group"
              >
                <i className="fab fa-telegram text-2xl text-blue-500 mb-3"></i>
                <span className="text-[10px] font-black uppercase text-blue-600">Telegram</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">{DEVELOPER_INFO.telegram}</span>
              </a>

              <a 
                href={DEVELOPER_INFO.whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 bg-green-50 dark:bg-green-900/10 rounded-[2rem] border border-green-100 dark:border-green-900/20 hover:scale-105 transition-all group"
              >
                <i className="fab fa-whatsapp text-2xl text-green-500 mb-3"></i>
                <span className="text-[10px] font-black uppercase text-green-600">WhatsApp</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">{DEVELOPER_INFO.whatsapp}</span>
              </a>

              <a 
                href={`mailto:${DEVELOPER_INFO.email}`}
                className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:scale-105 transition-all group"
              >
                <i className="fas fa-envelope text-2xl text-gray-500 mb-3"></i>
                <span className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-400">Email</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">{DEVELOPER_INFO.email}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperPage;
