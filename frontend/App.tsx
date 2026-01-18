
import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Library,
  NotebookPen,
  Settings,
  Flame,
  Check,
  X
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
import Logo from '../frontend/public/Collector_logo_black_EN.png';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security' | 'subscription' | 'personal' | 'insights' | 'help'>('profile');

  // Dashboard state
  const [dashboardInput, setDashboardInput] = useState('');
  const [dashboardQuizData, setDashboardQuizData] = useState<SingleQuiz[] | null>(null);
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Check-in Modal state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const contributionData = useMemo(() => {
    // Generate 5 weeks * 7 days = 35 days of data to simulate a month view
    // 0: no contribution, 1-5: increasing intensity
    return Array.from({ length: 35 }).map(() => {
      // Skew towards having some data
      const rand = Math.random();
      if (rand < 0.3) return 0;
      return Math.ceil(Math.random() * 5); 
    });
  }, []);

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
      
      // Logic for demo: 
      // - Future days are not done.
      // - Today is not done (to show target).
      // - Past days are mostly done, but simulate a missed day (e.g., Wednesday/idx 2).
      const isFuture = date.getTime() > today.getTime();
      const isToday = date.toDateString() === today.toDateString();
      // Simulate "Wednesday missed" (idx 2)
      const isMissed = idx === 2; 
      
      const done = !isFuture && !isToday && !isMissed;

      return {
        label: date.getDate(),
        done,
        isToday,
      };
    });
  }, []);

  const handleAnalyze = async () => {
    if (!dashboardInput.trim()) return;
    
    setDashboardLoading(true);
    setDashboardQuizData(null);
    setCurrentQuestionIndex(0);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: dashboardInput }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Analysis failed with status ${response.status}`);
      }

      const data: QuizListResponse = await response.json();
      if (data.article_id) {
        setCurrentArticleId(data.article_id);
      }
      setDashboardQuizData(data.items);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to analyze/generate quiz. Please check the backend connection.');
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
            articleId={currentArticleId}
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
            articleId={selectedArticleId || ''} 
            initialUrl={targetUrl}
            onBack={() => setCurrentView(View.LIBRARY)} 
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
          <div className="px-6 mb-7 flex items-center gap-3">
            <img src={Logo} alt="Collector" className="w-36 object-contain" />
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
              label="统计"
              active={currentView === View.LEARNING_DATA}
              onClick={() => setCurrentView(View.LEARNING_DATA)}
            />
          </div>

          <div className="w-full px-4 space-y-4 ">
            <button
              onClick={() => {
                setSettingsTab('profile');
                setCurrentView(View.SETTINGS);
              }}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-[18px] hover:bg-slate-50 text-slate-800 transition-all"
            >
              <div className="w-12 h-12 rounded-[20px] overflow-hidden bg-slate-200 shrink-0">
                <img
                  src="/avator.png"
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-base font-medium text-slate-900">全糖可乐</p>
              </div>
            </button>

            <div 
              onClick={() => setShowCheckInModal(true)}
              className="hidden md:block bg-[#f3f0ff] border border-[#ebe6ff] rounded-[22px] p-4 shadow-[0_10px_30px_-18px_rgba(106,90,249,0.6)] cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="flex items-center gap-2 text-[#6a5af9] font-semibold text-sm mb-3">
                <Flame size={16} className="fill-[#6a5af9] text-[#6a5af9]" />
                <span>打卡送会员</span>
              </div>
              <div className="flex items-center justify-between gap-1.5">
                {weekDays.map((day) => {
                  const baseCircle = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200';
                  
                  if (day.isToday) {
                    return (
                      <div key={day.label} className="flex flex-col items-center">
                        <div className={`${baseCircle} bg-white text-slate-900 border border-slate-600 ring-2 ring-[#6a5af9]/20`}>
                          <div className="w-2 h-2 rounded-full bg-slate-500" />
                        </div>
                      </div>
                    );
                  }

                  if (day.done) {
                    return (
                      <div key={day.label} className="flex flex-col items-center">
                        <div className={`${baseCircle} bg-[#6a5af9] text-white shadow-sm shadow-[#6a5af9]/30`}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={day.label} className="flex flex-col items-center">
                      <div className={`${baseCircle} bg-white/60 text-slate-400 border border-[#e5e5f0] shadow-sm`}>{day.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-[#f8fafc]/30">
        {renderView()}
      </main>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center animate-in fade-in duration-200 backdrop-blur-sm" onClick={(e) => { if(e.target === e.currentTarget) setShowCheckInModal(false); }}>
          <div className="bg-white rounded-[24px] p-6 w-[auto] shadow-2xl animate-in zoom-in-95 duration-200 relative border border-slate-100">
            <button 
              onClick={() => setShowCheckInModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <div className="mb-6 mr-10">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Flame className="text-[#6C57F0] fill-[#6C57F0]" size={24} />
                本月打卡记录
              </h3>
              <p className="text-slate-500 text-sm mt-1 ml-8">坚持阅读输入，点亮更多方块</p>
            </div>
            
            <div className="flex justify-center mb-2">
               <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                  {contributionData.map((level, i) => (
                    <div 
                      key={i} 
                      className={`w-4 h-4 rounded-[3px] transition-all hover:scale-125 ${
                        level === 0 ? 'bg-slate-100' :
                        level === 1 ? 'bg-[#6C57F0]/20' :
                        level === 2 ? 'bg-[#6C57F0]/40' :
                        level === 3 ? 'bg-[#6C57F0]/60' :
                        level === 4 ? 'bg-[#6C57F0]/80' :
                        'bg-[#6C57F0]'
                      }`}
                      title={`Contribution level: ${level}`}
                    />
                  ))}
               </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-400">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-[2px] bg-slate-100" />
                <div className="w-3 h-3 rounded-[2px] bg-[#6C57F0]/40" />
                <div className="w-3 h-3 rounded-[2px] bg-[#6C57F0]" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      )}
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
