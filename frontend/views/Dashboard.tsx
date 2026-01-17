
import React from 'react';
import { Loader2, ArrowRight, Link as LinkIcon, Headphones } from 'lucide-react';
import { SingleQuiz } from '../types';
import QuizCard from '../components/QuizCard';

interface DashboardProps {
  onStartReading: (id: string, url?: string) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  quizData: SingleQuiz[] | null;
  articleId: string | null;
  isLoading: boolean;
  currentQuestionIndex: number;
  onAnalyze: () => void;
  onNext: () => void;
  onNavigateToPodcast: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onStartReading,
  inputValue,
  setInputValue,
  quizData,
  articleId,
  isLoading,
  currentQuestionIndex,
  onAnalyze,
  onNext,
  onNavigateToPodcast
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-16 bg-white animate-in fade-in duration-700 relative">
      <button
        onClick={onNavigateToPodcast}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-500 text-white text-sm font-semibold shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
      >
        <Headphones size={18} />
        <span className="hidden sm:inline">听播客</span>
      </button>
      <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-8">
        <div className="w-full flex items-center justify-center">
          <img
            src="/hero.png"
            alt="Logo cluster"
            className="w-64 max-w-full drop-shadow-2xl"
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-xl font-semibold text-slate-700">收入你想收的</h1>
        </div>

        <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-sm rounded-xl flex items-center gap-3 px-4 py-3">
          <LinkIcon size={18} className="text-slate-400" />
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAnalyze()}
            placeholder="输入或粘贴链接..." 
            className="flex-1 bg-transparent px-1 py-2 outline-none text-slate-800 placeholder:text-slate-400 text-base"
          />
          <button 
            onClick={() => onAnalyze()}
            disabled={isLoading || !inputValue}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold shadow-sm transition-all hover:bg-black active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
            <span>收录</span>
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 text-slate-500 text-sm">
            <Loader2 className="animate-spin text-indigo-600" size={18} />
            <span>AI 正在收录链接...</span>
          </div>
        )}

        {quizData && quizData.length > 0 && quizData[currentQuestionIndex] && (
          <div className="w-full max-w-4xl mt-12 animate-in slide-in-from-bottom-4 duration-700">
            <QuizCard
              key={currentQuestionIndex}
              articleId={articleId || ""}
              question={quizData[currentQuestionIndex].question}
              options={quizData[currentQuestionIndex].options}
              evidence={quizData[currentQuestionIndex].evidence}
                jumpUrl={quizData[currentQuestionIndex].jump_url || inputValue}
                sourceTitle={quizData[currentQuestionIndex].source_title}
                sourceLogo={quizData[currentQuestionIndex].source_logo}
                sourceCover={quizData[currentQuestionIndex].source_cover}
              onNext={onNext}
              onDeepRead={(id) => onStartReading(id, inputValue)}
              isLast={currentQuestionIndex === quizData.length - 1}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
