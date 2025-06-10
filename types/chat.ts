export interface ChatMessage {
  id?: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  references?: ReferenceChunk[];
}

export interface ChatSession {
  id: string;
  chatId?: string;
  name: string;
  timestamp: number; // from update_time or create_time
  lastMessage: string;
  messages: ChatMessage[];
}

export interface ReferenceChunk {
  id: string;
  content: string;
  document_id: string;
  document_name: string;
  dataset_id: string;
  image_id?: string;
  similarity?: number;
  term_similarity?: number;
  vector_similarity?: number;
  positions?: any[];
}
