export interface ChatSession {
  id: string;
  bookId: string;
  timestamp: number;
  lastMessage: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: number;
  isUser: boolean;
}