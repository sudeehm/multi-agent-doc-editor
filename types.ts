export enum AgentState {
  IDLE = 'IDLE',
  READING_FILES = 'READING_FILES',
  ANALYZING_QUESTIONS = 'ANALYZING_QUESTIONS',
  SOLVING = 'SOLVING',
  COMPILING = 'COMPILING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface FileData {
  name: string;
  type: 'question-bank' | 'source-material';
  content: string; // Extracted text content
  fileObject: File;
}

export interface QuestionItem {
  id: string;
  originalText: string;
  answer?: string;
  status: 'pending' | 'solving' | 'done' | 'error';
}

export interface AgentLog {
  timestamp: number;
  agent: 'READER' | 'ANALYST' | 'SOLVER' | 'WRITER' | 'SYSTEM';
  message: string;
}

export interface ProcessingStats {
  totalQuestions: number;
  solvedQuestions: number;
  startTime: number;
  endTime?: number;
}
