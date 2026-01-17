
export enum View {
  DASHBOARD = 'dashboard',
  LIBRARY = 'library',
  READER = 'reader',
  KNOWLEDGE = 'knowledge',
  LEARNING_DATA = 'learning_data',
  SETTINGS = 'settings',
  SUBSCRIPTION = 'subscription',
  PODCAST = 'podcast',
  AI_QUIZ = 'ai_quiz'
}

export interface QuizQuestion {
  id: string;
  type: 'single' | 'multiple' | 'text';
  question: string;
  options?: string[]; // For single/multiple
  correctAnswer?: number | number[]; // Index for single/multiple
  explanation: string;
  relatedArticleId: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
  questionId: string;
  userAnswer: number | number[] | string;
  isCorrect: boolean;
  timestamp: string;
}

export interface QuizReport {
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  weakPoints: string[]; // Related article titles
  results: QuizResult[];
}

export interface Article {
  id: string;
  title: string;
  author: string;
  source: string;
  progress: number;
  coverImage: string;
  wordCount: number;
  estimatedTime: number;
  status: 'pending' | 'parsed' | 'quiz_generated' | 'completed';
}

export interface SingleQuiz {
  question: string;
  options: string[];
  correct_answer: string;
  evidence: string;
  jump_url: string;
  source_title?: string;
  source_logo?: string;
  source_cover?: string;
}

export interface QuizListResponse {
  items: SingleQuiz[];
  article_id?: string;
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  style: 'provocative' | 'humorous' | 'philosophical' | 'counterintuitive';
}

export interface ContentFragment {
  id: string;
  content: string;
  isUnlocked: boolean;
}

export interface KnowledgeCard {
  id: string;
  originalContent: string;
  reflection: string;
  tags: string[];
  createdAt: string;
  articleTitle: string;
}

export interface UserStats {
  articlesRead: number;
  quizzesCompleted: number;
  cardsCreated: number;
  streak: number;
}
