// types/document.ts

export interface ParserConfig {
  chunk_token_count: number;
  delimiter: string;
  layout_recognize: boolean;
  task_page_size: number;
}

export interface Document {
  id: string;
  knowledgebase_id: string;
  name: string;
  location: string;
  create_date: string;
  create_time: number;
  update_date: string;
  update_time: number;
  created_by: string;
  chunk_count: number;
  chunk_method: string;
  process_begin_at: string | null;
  process_duation: number;
  progress: number;
  progress_msg: string;
  run: string;
  size: number;
  source_type: string;
  status: string;
  token_count: number;
  type: string;
  thumbnail: string | null;
  parser_config: ParserConfig;
}