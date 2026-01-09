
import { GoogleGenAI } from "@google/genai";
import { ORG_INFO } from "../constants";
import { ChatMessage } from "../types";

const getAIClient = () => {
  const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }
  return new GoogleGenAI({ apiKey });
};

export const chatWithKonstantin = async (history: ChatMessage[]) => {
  const ai = getAIClient();
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dayOfWeek = now.toLocaleDateString('ru-RU', { weekday: 'long' });
  const dayNumber = now.getDate();
  const monthNumber = now.getMonth() + 1;
  const year = now.getFullYear();

  const systemInstruction = `Ты Константин, помощник МКУ ПМО "Хозяйственное управление" Питкяранты.

ТЕКУЩИЕ ДАННЫЕ:
Дата: ${dayNumber}.${monthNumber}.${year} (${dayOfWeek}), время: ${timeStr}
Срок передачи показаний: ${ORG_INFO.readingPeriod}
Тарифы: ХВС ${ORG_INFO.tariffs.cold}₽/м³, ГВС ${ORG_INFO.tariffs.hot}₽/м³, водоотведение ${ORG_INFO.tariffs.disposal}₽/м³
Телефон: ${ORG_INFO.phone} | Диспетчерская 24/7: ${ORG_INFO.dispatchPhone} | Email: ${ORG_INFO.email}
Адрес: ${ORG_INFO.address}

ПРАВИЛА ОТВЕТОВ:
1. Отвечай ОЧЕНЬ КРАТКО и конкретно (1-2 предложения максимум)
2. НЕ повторяй приветствие, если пользователь не поздоровался
3. Используй ТОЛЬКО достоверные данные выше, не придумывай
4. О передаче показаний: "Используйте раздел 'Передать данные' в личном кабинете с ${ORG_INFO.readingPeriod}"
5. При чрезвычайной ситуации (протечка, авария): "Позвоните диспетчерской: ${ORG_INFO.dispatchPhone}"
6. При вопросе о дате/времени - дай точный ответ из текущих данных выше
7. При непонимании вопроса - не гадай, предложи позвонить: ${ORG_INFO.phone}
8. Стиль: вежливый, профессиональный, без лишних слов
9. При вопросе "кто ты" - просто ответь "Константин, помощник управления"
10. Запрещено: объяснять как работает ИИ, говорить "я не знаю" - предложи звонок вместо этого

ПРИМЕРЫ:
"Как передать показания?" → "В разделе 'Передать данные' личного кабинета с ${ORG_INFO.readingPeriod}"
"Какой тариф на холодную воду?" → "ХВС - ${ORG_INFO.tariffs.cold}₽/м³"
"Протечка!" → "Позвоните диспетчерской ${ORG_INFO.dispatchPhone}"
"Спасибо" → "Пожалуйста! Обращайтесь при необходимости."
"Привет" → "Здравствуйте! Чем помочь?"`;


  try {
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: contents as any,
      config: {
        systemInstruction,
        temperature: 0.1,
        topP: 0.7,
        topK: 20,
        maxOutputTokens: 200,
      },
    });
    
    const responseText = response.text?.trim();
    if (!responseText) {
      return "Повторите вопрос или позвоните на номер " + ORG_INFO.phone;
    }
    
    return responseText;
  } catch (error) {
    console.error("Gemini Error:", error);
    const errorMsg = error instanceof Error ? error.message : '';
    
    if (errorMsg.includes('API') || errorMsg.includes('key')) {
      return "Ошибка подключения. Обратитесь в службу поддержки: " + ORG_INFO.email;
    }
    
    return "Извините, временно не могу ответить. Позвоните в диспетчерскую: " + ORG_INFO.dispatchPhone;
  }
};
