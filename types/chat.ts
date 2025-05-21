export interface ChatMessage {
  id?: string;
  content: string;
  timestamp?: number;
  isUser: boolean;
}

export interface ChatSession {
  id: string;
  chatId?: string;
  name: string;
  timestamp: number; // from update_time or create_time
  lastMessage: string;
  messages: ChatMessage[];
}
