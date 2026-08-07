export type ScreenType = 'dashboard' | 'voice' | 'chat' | 'settings';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text?: string;
  isAudio?: boolean;
  audioDuration?: string;
  cardContent?: {
    title: string;
    description: string;
    features?: string[];
  };
  timestamp: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

export interface AppSettings {
  apiKey: string;
  model: string;
  systemInstructions: string;
}

export interface UserProfileData {
  age: string;
  state: string;
  occupation: string;
  education: string;
  income: string;
}

export interface GovernmentScheme {
  id: string;
  title: string;
  type: string;
  benefit: string;
  matchText: string;
  provider: string;
}

export interface TopicPill {
  id: string;
  label: string;
  category: string;
}

export interface InfoArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  fullText: string;
  readTime: string;
  iconBg: string;
}
