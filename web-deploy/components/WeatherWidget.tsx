
import React, { useEffect, useState } from 'react';
import { User } from '../types';

interface WeatherWidgetProps {
  user?: User;
}

interface WeatherData {
  temp: number;
  apparentTemp: number;
  windSpeed: number;
  windDirection: string;
  icon: string;
  desc: string;
  weatherCode: number;
  providerName: string;
}

// Карта координат для населенных пунктов Питкярантского района
const SETTLEMENT_COORDS: Record<string, { lat: number; lon: number }> = {
  'г. Питкяранта': { lat: 61.57, lon: 31.48 },
  'п. Салми': { lat: 61.37, lon: 31.85 },
  'п. Ляскеля': { lat: 61.76, lon: 31.00 },
  'п. Импилахти': { lat: 61.67, lon: 31.15 },
  'п. Харлу': { lat: 61.81, lon: 30.93 },
  'д. Хийденсельга': { lat: 61.72, lon: 30.98 },
  'д. Ряймяля': { lat: 61.37, lon: 32.18 },
  'п. Койриноя': { lat: 61.64, lon: 31.40 },
  'д. Мурсула': { lat: 61.60, lon: 31.50 },
  'д. Мансила': { lat: 61.31, lon: 32.61 }
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ user }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [view, setView] = useState<'weather' | 'time'>('weather');
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const currentSettlement = user?.settlement || 'г. Питкяранта';
  const provider = user?.weatherProvider || 'open-meteo';
  const coords = SETTLEMENT_COORDS[currentSettlement] || SETTLEMENT_COORDS['г. Питкяранта'];

  const shortSettlementName = currentSettlement.replace(/^(г\.|п\.|д\.)\s+/, '');

  const getWindDirectionLabel = (degree: number): string => {
    const directions = ['с', 'с/в', 'в', 'ю/в', 'ю', 'ю/з', 'з', 'с/з'];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
  };

  const getClothingAdvice = (temp: number, wind: number, code: number) => {
    let advice = "";
    if (temp <= -25) advice = "Экстремальный холод! Три слоя одежды: термобелье, флис и плотный пуховик. Закройте лицо шарфом.";
    else if (temp <= -15) advice = "Сильный мороз. Теплый пуховик, шерстяные носки и варежки. Не забудьте шапку!";
    else if (temp <= -5) advice = "Умеренный мороз. Обычная зимняя одежда и теплая обувь на толстой подошве.";
    else if (temp <= 5) advice = "Пограничная температура. Одевайтесь многослойно: легкая куртка поверх свитера.";
    else if (temp <= 12) advice = "Прохладно. Подойдет демисезонная куртка или пальто. Легкий шарф защитит от ветра.";
    else if (temp <= 18) advice = "Комфортно. Плотное худи или джинсовка будут в самый раз. В тени может быть зябко.";
    else if (temp <= 24) advice = "Приятное тепло. Легкие брюки, футболка и комфортная обувь для прогулок.";
    else if (temp <= 30) advice = "Жарко. Выбирайте натуральные ткани и не забудьте про солнцезащитные очки.";
    else advice = "Сильная жара! Легкая светлая одежда, головной убор и больше воды.";

    if (wind > 8) advice += " Ветер очень сильный, наденьте ветровку с капюшоном.";
    else if (wind > 5) advice += " Ощутимый ветер, легкая защита не помешает.";

    if (code >= 51 && code <= 67) advice += " Идет дождь — захватите зонт.";
    else if (code >= 71 && code <= 86) advice += " Снегопад — выбирайте непромокаемую обувь.";
    return advice;
  };

  const fetchWeather = async () => {
    try {
      let url = "";
      let providerLabel = "Open-Meteo";
      
      // Логика выбора провайдера (имитация для демо, использование Open-Meteo как базы)
      if (provider === 'open-meteo') {
        url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&wind_speed_unit=ms`;
        providerLabel = "Open-Meteo";
      } else if (provider === 'openweathermap') {
        url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&wind_speed_unit=ms`;
        providerLabel = "OpenWeatherMap";
      } else {
        url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&wind_speed_unit=ms`;
        providerLabel = "WeatherAPI";
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.current) {
        const { temperature_2m, apparent_temperature, weather_code, wind_speed_10m, wind_direction_10m } = data.current;
        
        let icon = 'fa-sun';
        let desc = 'Ясно';
        
        if (weather_code === 0) { desc = 'Ясно'; icon = 'fa-sun'; }
        else if (weather_code === 1) { desc = 'Преимущественно ясно'; icon = 'fa-cloud-sun'; }
        else if (weather_code === 2) { desc = 'Переменная облачность'; icon = 'fa-cloud-sun'; }
        else if (weather_code === 3) { desc = 'Пасмурно'; icon = 'fa-cloud'; }
        else if (weather_code >= 45 && weather_code <= 48) { desc = 'Туман'; icon = 'fa-smog'; }
        else if (weather_code >= 51 && weather_code <= 55) { desc = 'Морось'; icon = 'fa-cloud-rain'; }
        else if (weather_code >= 61 && weather_code <= 67) { desc = 'Дождь'; icon = 'fa-cloud-showers-heavy'; }
        else if (weather_code >= 71 && weather_code <= 77) { desc = 'Снегопад'; icon = 'fa-snowflake'; }
        else if (weather_code >= 80 && weather_code <= 82) { desc = 'Ливневый дождь'; icon = 'fa-cloud-showers-water'; }
        else if (weather_code >= 95) { desc = 'Гроза'; icon = 'fa-bolt-lightning'; }

        setWeather({
          temp: Math.round(temperature_2m),
          apparentTemp: Math.round(apparent_temperature),
          windSpeed: Math.round(wind_speed_10m),
          windDirection: getWindDirectionLabel(wind_direction_10m),
          icon, desc, weatherCode: weather_code,
          providerName: providerLabel
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Weather fetch failed", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchWeather();

    // Обновление погоды каждые 5 минут
    const weatherInterval = setInterval(fetchWeather, 5 * 60 * 1000);

    const timeInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\./g, ':'));
    }, 1000);

    const switchInterval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setView(prev => prev === 'weather' ? 'time' : 'weather');
        setIsVisible(true);
      }, 500);
    }, 10000);

    return () => {
      clearInterval(weatherInterval);
      clearInterval(timeInterval);
      clearInterval(switchInterval);
    };
  }, [coords, provider]);

  if (loading || !weather) return <div className="w-24 h-8 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>;

  return (
    <div className="relative group/weather">
      <div 
        className={`flex items-center space-x-2 sm:space-x-3 text-[13px] sm:text-sm font-bold text-gray-700 dark:text-gray-300 transition-all duration-500 transform cursor-help ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-800 shrink-0">
          <i className={`fas ${view === 'weather' ? weather.icon + (weather.icon.includes('sun') ? ' text-yellow-500' : ' text-blue-400') : 'fa-clock text-primary-500'} transition-all duration-300`}></i>
        </div>
        <div className="flex flex-col text-left overflow-hidden">
          <span className="leading-tight tabular-nums flex items-center gap-1.5 whitespace-nowrap">
            {view === 'weather' ? (
              <>
                <span className="opacity-60 font-black">{shortSettlementName}</span>
                <span className="text-primary-600">/</span>
                <span className="shrink-0">{weather.temp > 0 ? '+' : ''}{weather.temp}°C</span>
              </>
            ) : (
              <span className="shrink-0">{currentTime}</span>
            )}
          </span>
          <span className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-tight font-black leading-none mt-0.5 truncate max-w-[140px]">
            {view === 'weather' ? weather.desc : currentDate}
          </span>
        </div>
      </div>

      {showTooltip && (
        <div className="absolute top-full right-0 mt-4 w-72 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3 border-gray-50 dark:border-gray-800">
              <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Прогноз</span>
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-black text-primary-600 truncate max-w-[150px]">{currentSettlement}</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase">Источник: {weather.providerName}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase">Ощущается</span>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{weather.apparentTemp > 0 ? '+' : ''}{weather.apparentTemp}°</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-gray-400 uppercase">Ветер</span>
                <p className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                  {weather.windSpeed} м/с <span className="text-primary-600 ml-1">{weather.windDirection}</span>
                </p>
              </div>
            </div>
            <div className="bg-gray-900 dark:bg-primary-900/30 p-4 rounded-2xl border border-gray-800 shadow-inner">
              <span className="text-[10px] font-black text-white/50 uppercase block mb-2">Совет по одежде</span>
              <p className="text-sm font-bold text-gray-100 leading-snug">
                {getClothingAdvice(weather.apparentTemp, weather.windSpeed, weather.weatherCode)}
              </p>
            </div>
          </div>
          <div className="absolute -top-[9px] right-8 w-4 h-4 bg-white dark:bg-gray-900 border-l-2 border-t-2 border-gray-100 dark:border-gray-800 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
