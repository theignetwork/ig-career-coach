export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  showSources?: boolean; // Add this property
  timestamp: Date;
}

export interface Source {
  title: string;
  url: string;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  sources?: Source[];
}

export interface ChatRequest {
  message: string;
  conversationId: string | null;
  toolContext: string | null;
}

export interface ConversationHistory {
  messages: Message[];
  conversationId: string | null;
}

export interface WelcomeTile {
  icon: string;
  title: string;
  description: string;
  query: string;
}
