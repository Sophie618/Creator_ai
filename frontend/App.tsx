
import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Library,
  NotebookPen,
  Settings,
  Flame,
  Check,
  Circle
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
import Logo from '/Collector_logo_black_EN.png';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security' | 'subscription' | 'personal' | 'insights' | 'help'>('profile');

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

  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay() || 7; // Monday as first day
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek - 1));
    return Array.from({ length: 7 }).map((_, idx) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + idx);
      return {
        label: date.getDate(),
        done: date.getTime() <= today.getTime(),
        isToday: date.toDateString() === today.toDateString(),
      };
    });
  }, []);

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
        return (
          <SettingsView 
            initialTab={settingsTab}
            onTabChange={setSettingsTab}
            onUpgrade={() => {
              setSettingsTab('subscription');
              setCurrentView(View.SUBSCRIPTION);
            }} 
          />
        );
      case View.SUBSCRIPTION:
        return (
          <SubscriptionView 
            onBack={() => {
              setSettingsTab('subscription');
              setCurrentView(View.SETTINGS);
            }} 
          />
        );
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
        <nav className="w-20 md:w-72 bg-white border-r border-slate-100 flex flex-col items-center md:items-stretch py-8 transition-all duration-300 z-50">
          <div className="px-6 mb-10 flex items-center gap-3">
            <img src={Logo} alt="Collector" className="w-28 object-contain" />
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
              label="收藏"
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

          <div className="w-full px-4 space-y-4">
            <button
              onClick={() => {
                setSettingsTab('profile');
                setCurrentView(View.SETTINGS);
              }}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-[18px] bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80"
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-base font-bold text-slate-900">全糖可乐</p>
                <p className="text-xs text-slate-500">点击进入个人中心</p>
              </div>
            </button>

            <div className="bg-indigo-50/80 border border-indigo-100 rounded-[20px] p-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-3">
                <Flame size={16} /> 打卡送会员
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="px-2 py-1 bg-white rounded-full font-bold text-indigo-600">本周</span>
                <span>坚持阅读赢奖励</span>
              </div>
              <div className="flex items-center gap-2 justify-between">
                {weekDays.map((day) => (
                  <div key={day.label} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                        day.done
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-500 border-indigo-100'
                      } ${day.isToday ? 'ring-2 ring-indigo-200' : ''}`}
                    >
                      {day.label}
                    </div>
                    {day.done ? (
                      <Check size={14} className="text-indigo-600" />
                    ) : (
                      <Circle size={12} className="text-indigo-200" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSettingsTab('profile');
                setCurrentView(View.SETTINGS);
              }}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-[20px] bg-white border border-slate-200 text-slate-800 hover:border-indigo-200 hover:shadow-sm transition-all"
            >
              <Settings size={20} />
              <span className="hidden md:block text-sm font-semibold">个人中心 · 升级 PRO</span>
            </button>
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
