import { Article } from '../types';

export const MOCK_ARTICLES: Article[] = [
  { 
    id: '1', 
    title: '蔡格尼克效应的心理学原理', 
    author: 'Dr. Jane Smith', 
    source: 'Medium', 
    progress: 45, 
    coverImage: 'https://picsum.photos/seed/psy/800/600',
    wordCount: 1200,
    estimatedTime: 8,
    status: 'quiz_generated'
  },
  { 
    id: '2', 
    title: 'AI 如何重塑人类的好奇心', 
    author: 'Tech Insight', 
    source: 'Scientific American', 
    progress: 0, 
    coverImage: 'https://picsum.photos/seed/ai/800/600',
    wordCount: 2500,
    estimatedTime: 15,
    status: 'parsed'
  },
  { 
    id: '3', 
    title: '为持续参与而设计', 
    author: 'Liam Chen', 
    source: 'UX Collective', 
    progress: 100, 
    coverImage: 'https://picsum.photos/seed/design/800/600',
    wordCount: 1800,
    estimatedTime: 12,
    status: 'completed'
  },
  { 
    id: '4', 
    title: '神经接口的未来', 
    author: 'Sarah Jenkins', 
    source: 'ArXiv', 
    progress: 0, 
    coverImage: 'https://picsum.photos/seed/neuro/800/600',
    wordCount: 5000,
    estimatedTime: 30,
    status: 'pending'
  },
];
