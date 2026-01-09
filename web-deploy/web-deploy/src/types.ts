
export interface User {
  id: string;
  accountNumber: string; // Лицевой счет
  fullName: string;
  address: string;
  settlement: string; // Населенный пункт
  phone: string;
  email: string;
  isAdmin: boolean;
  password?: string; // Optional password for login
  avatarUrl?: string; // URL to the user's avatar
  themeColor?: string; // Preferred accent color (e.g., 'blue', 'green', 'purple')
  weatherProvider?: 'open-meteo' | 'openweathermap' | 'weatherapi';
  // Поля для юридических лиц
  isLegalEntity?: boolean;
  legalEntityType?: 'ИП' | 'ООО' | 'АО' | 'ПАО' | 'МКУ' | 'МАУ' | 'ТСЖ';
  companyName?: string;
  inn?: string;
  // Поле для двойных счетчиков
  hasDualMeters?: boolean; // Есть ли по два счетчика ХВС и ГВС
}

export interface WaterReading {
  id: string;
  userId: string;
  coldWater: number;
  hotWater: number;
  coldWater2?: number; // Второй счетчик ХВС
  hotWater2?: number; // Второй счетчик ГВС
  submissionDate: string; // ISO format
}

export interface BillingRecord {
  id: string;
  userId: string;
  readingId?: string; // Ссылка на показания, если счет за них
  amount: number;
  description: string;
  status: 'paid' | 'unpaid' | 'processing';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
}

export type ApplicationStatus = 'pending' | 'in_progress' | 'completed' | 'archived';
export type MeterType = 'cold' | 'hot' | 'both';
export type ServiceType = 'verification' | 'replacement' | 'water_delivery';
export type NewsType = 'emergency' | 'planned' | 'info';

export interface NewsItem {
  id: string;
  type: NewsType;
  title: string;
  content: string;
  settlement: string;
  recoveryTime?: string;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  userId: string;
  text: string;
  isRead: boolean; // Прочитано ли админом
  adminReply?: string; // Ответ администратора
  repliedAt?: string; // Дата ответа
  isUserRead?: boolean; // Прочитано ли пользователем (ответ)
  createdAt: string;
}

export interface ServiceApplication {
  id: string;
  userId: string;
  serviceType: ServiceType;
  meterType?: MeterType;
  deliveryAddress?: string;
  deliveryVolume?: number; // в литрах или м3
  contactPhone: string;
  preferredDateTime: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt?: string;
  plumberId?: string; // ID назначенного сантехника
  assignedAt?: string; // Дата назначения
}

export interface Plumber {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  specialization: 'verification' | 'replacement' | 'general'; // Специализация
  isActive: boolean;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export enum ViewMode {
  Landing = 'landing',
  UserDashboard = 'user_dashboard',
  AdminPanel = 'admin_panel',
  PrivacyPolicy = 'privacy_policy',
  TermsOfUse = 'terms_of_use',
  UserManual = 'user_manual',
  AdminManual = 'admin_manual',
  DeveloperPage = 'developer_page'
}
