
import React from 'react';
import { ORG_INFO } from '../constants';

interface MapModalProps {
  onClose: () => void;
}

const MapModal: React.FC<MapModalProps> = ({ onClose }) => {
  // Яндекс.Карты используют формат [долгота, широта] для параметров ll и pt
  const { lat, lng } = ORG_INFO.coords;
  
  // Формируем URL виджета Яндекс.Карт
  // z=17.5 — оптимальный масштаб для города
  // pt=lng,lat,pm2blm — синяя метка (pm2blm)
  const yandexWidgetUrl = `https://yandex.ru/map-widget/v1/?ll=${lng}%2C${lat}&z=17.5&pt=${lng}%2C${lat}%2Cpm2blm`;
  
  const externalMapsUrl = `https://yandex.ru/maps/?ll=${lng}%2C${lat}&z=17.5&mode=search&ol=geo&pt=${lng}%2C${lat}`;

  return (
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in duration-300">
        <div className="p-6 md:p-8 border-b dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center text-xl transition-transform hover:scale-110">
              <i className="fas fa-map-location-dot"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Наше местонахождение</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{ORG_INFO.address}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110 active:scale-90"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="relative h-[400px] md:h-[500px] w-full bg-gray-100 dark:bg-gray-950">
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            src={yandexWidgetUrl}
            allowFullScreen={true}
            style={{ position: 'relative' }}
            title="Офис Хозуправления Питкяранта на Яндекс Картах"
          ></iframe>
          
          <div className="absolute bottom-6 right-6 flex space-x-4">
            <a 
              href={externalMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <i className="fas fa-route text-primary-600"></i>
              Маршрут
            </a>
          </div>
        </div>

        <div className="p-8 bg-gray-50 dark:bg-gray-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Режим работы офиса</div>
             <div className="text-sm font-bold text-gray-700 dark:text-gray-300">Пн — Пт: 08:30 – 17:30 (Обед 13:00 – 14:00)</div>
          </div>
          <button 
            onClick={onClose}
            className="w-full md:w-auto px-10 py-4 bg-primary-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
