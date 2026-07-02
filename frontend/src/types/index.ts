export interface HealthResponse {
  status: string;
  model?: string;
}

export interface AskResponse {
  answer: string;
  model: string;
  tokens_used: number;
  generation_time: number;
  faq_section?: string;
}

export interface AskRequest {
  question: string;
  temperature: number;
}

export interface FeedbackRequest {
  question: string;
  answer: string;
  rating: string;
}

export interface ConversationTurn {
  question: string;
  answer: string;
  meta: AskResponse;
}

export interface ApiError {
  detail: string;
}