export interface ChatMessage {
  id: string;
  content: string;
  timestamp: number;
  isUser: boolean;
}

export interface ChatSession {
  id: string;
  timestamp: number; // from update_time
  lastMessage: string; // from last message if available
  messages: ChatMessage[];
}