export interface Dataset {
  id: string;
  name: string;
  description: string | null;
  language: string;
  create_date: string;
  update_date: string;
  document_count: number;
  chunk_count: number;
  status: string;
  avatar: string;
}

export interface ApiResponse {
  code: number;
  data: Dataset[];
}