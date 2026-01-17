
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Library, 
  BrainCircuit, 
  NotebookPen, 
  Settings, 
  Plus,
  Flame,
  CreditCard,
  Crown,
  Headphones,
  MessageSquare
} from 'lucide-react';
import Dashboard from './views/Dashboard';
import LibraryView from './views/LibraryView';
import ReaderView from './views/ReaderView';
import KnowledgeBase from './views/KnowledgeBase';
import SettingsView from './views/SettingsView';
import LearningData from './views/LearningData';
import PodcastView from './views/PodcastView';
import SubscriptionView from './views/SubscriptionView';
import { View, SingleQuiz, QuizListResponse } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string>('');

  // Dashboard state
  const [dashboardInput, setDashboardInput] = useState('');
  const [dashboardQuizData, setDashboardQuizData] = useState<SingleQuiz[] | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const navigateToReader = (articleId: string, url: string = '') => {
    setSelectedArticleId(articleId);
    setTargetUrl(url);
    setCurrentView(View.READER);
  };

  const handleAnalyze = async () => {
    if (!dashboardInput.trim()) return;
    
    setDashboardLoading(true);
    setDashboardQuizData(null);
    setCurrentQuestionIndex(0);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: dashboardInput }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data: QuizListResponse = await response.json();
      setDashboardQuizData(data.items);
    } catch (error) {
      console.error(error);
      alert('Failed to analyze/generate quiz. Please check the backend connection.');
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prev => {
      if (!dashboardQuizData || dashboardQuizData.length === 0) return prev;
      return (prev + 1) % dashboardQuizData.length;
    });
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return (
          <Dashboard 
            onStartReading={(id, url) => navigateToReader(id, url)}
            inputValue={dashboardInput}
            setInputValue={setDashboardInput}
            quizData={dashboardQuizData}
            isLoading={dashboardLoading}
            currentQuestionIndex={currentQuestionIndex}
            onAnalyze={handleAnalyze}
            onNext={handleNextQuestion}
            onNavigateToPodcast={() => setCurrentView(View.PODCAST)}
          />
        );
      case View.LIBRARY:
        return <LibraryView onSelectArticle={(id) => navigateToReader(id)} />;
      case View.READER:
        return (
          <ReaderView 
            articleId={selectedArticleId || '1'} 
            initialUrl={targetUrl}
            onBack={() => setCurrentView(View.DASHBOARD)} 
          />
        );
      case View.KNOWLEDGE:
        return <KnowledgeBase />;
      case View.LEARNING_DATA:
        return <LearningData />;
      case View.PODCAST:
        return <PodcastView />;
      case View.SETTINGS:
        return <SettingsView onUpgrade={() => setCurrentView(View.SUBSCRIPTION)} />;
      case View.SUBSCRIPTION:
        return <SubscriptionView onBack={() => setCurrentView(View.DASHBOARD)} />;
      default:
        return (
          <Dashboard 
            onStartReading={(id, url) => navigateToReader(id, url)}
            inputValue={dashboardInput}
            setInputValue={setDashboardInput}
            quizData={dashboardQuizData}
            isLoading={dashboardLoading}
            currentQuestionIndex={currentQuestionIndex}
            onAnalyze={handleAnalyze}
            onNext={handleNextQuestion}
            onNavigateToPodcast={() => setCurrentView(View.PODCAST)}
          />
        );
    }
  };

  const isReaderView = currentView === View.READER;

  return (
    <div className={`flex h-screen ${isReaderView ? 'bg-[#0a0a0a]' : 'bg-white'} text-slate-900 overflow-hidden`}>
      {/* Sidebar Navigation */}
      {!isReaderView && (
        <nav className="w-20 md:w-64 bg-white border-r border-slate-100 flex flex-col items-center md:items-stretch py-8 transition-all duration-300 z-50">
          <div className="px-6 mb-12 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[18px] flex items-center justify-center shadow-lg shadow-indigo-100 ring-4 ring-indigo-50">
              <BrainCircuit className="text-white w-7 h-7" />
            </div>
            <span className="hidden md:block text-2xl font-black tracking-tight text-slate-900">Read AI</span>
          </div>

          <div className="flex-1 space-y-2 px-4 overflow-y-auto">
            <NavItem 
              icon={<LayoutDashboard size={22} />} 
              label="首页" 
              active={currentView === View.DASHBOARD} 
              onClick={() => setCurrentView(View.DASHBOARD)} 
            />
            <NavItem 
              icon={<Library size={22} />} 
              label="收录" 
              active={currentView === View.LIBRARY} 
              onClick={() => setCurrentView(View.LIBRARY)} 
            />
            <NavItem 
              icon={<NotebookPen size={22} />} 
              label="我的" 
              active={currentView === View.LEARNING_DATA} 
              onClick={() => setCurrentView(View.LEARNING_DATA)} 
            />
          </div>

          <div className="px-4 py-6 border-t border-slate-50 space-y-4">
             {/* Upgrade Button in Sidebar */}
             <button 
              onClick={() => setCurrentView(View.SUBSCRIPTION)}
              className="hidden md:flex w-full items-center gap-3 px-5 py-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-[20px] text-white shadow-lg shadow-amber-100 hover:scale-[1.02] transition-all group"
             >
                <Crown size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="text-sm font-black">升级到 PRO</span>
             </button>
            <NavItem 
              icon={<Settings size={22} />} 
              label="个人中心" 
              active={currentView === View.SETTINGS} 
              onClick={() => setCurrentView(View.SETTINGS)} 
            />
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-[#f8fafc]/30">
        {renderView()}
      </main>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all group ${
      active 
        ? 'bg-indigo-50/80 text-indigo-600 font-bold' 
        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
    <span className="hidden md:block text-[15px]">{label}</span>
  </button>
);

export default App;
