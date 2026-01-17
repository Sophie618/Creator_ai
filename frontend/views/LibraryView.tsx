
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Grid2X2, 
  List, 
  Plus, 
  Clock, 
  CheckCircle2, 
  MoreVertical,
  Link as LinkIcon,
  MessageCircle,
  Hash,
  BookOpen,
  FileText,
  LayoutGrid,
  Sparkles,
  Mic,
  Send,
  X,
  BrainCircuit,
  Loader2,
  Volume2,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Article } from '../types';
import { MOCK_ARTICLES } from '../data/mockData';
import { GoogleGenAI } from "@google/genai";

const FourPointStar = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
  </svg>
);

interface CollectedArticle {
  id: string;
  title: string;
  url: string;
  cover_image?: string;
  coverImage?: string;
  source: string;
  word_count: number;
  wordCount?: number;
  estimated_time: number;
  estimatedTime?: number;
  status: string;
  created_at: string;
  createdAt?: string;
  progress?: number;
}

interface LibraryViewProps {
  onSelectArticle: (id: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ onSelectArticle }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('所有状态');
  const [showAssistant, setShowAssistant] = useState(true);
  const [collectedArticles, setCollectedArticles] = useState<CollectedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { name: '全部', icon: <LayoutGrid size={14} />, color: 'bg-slate-100 text-slate-600' },
    { name: '公众号', icon: <MessageCircle size={14} />, color: 'bg-emerald-50 text-emerald-600', sourceKey: '公众号' },
    { name: '小红书', icon: <Hash size={14} />, color: 'bg-rose-50 text-rose-600', sourceKey: '小红书' },
    { name: '哔哩哔哩', icon: <BookOpen size={14} />, color: 'bg-indigo-50 text-indigo-600', sourceKey: '哔哩哔哩' },
    
  ];

  const statusMap: Record<string, string> = {
    'pending': '等待处理',
    'parsed': '已解析',
    'quiz_generated': '挑战已生成',
    'completed': '已读完'
  };

  // 从后端获取收录文章
  useEffect(() => {
    const fetchCollectedArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/collected-articles');
        if (response.ok) {
          const data = await response.json();
          const normalized = (data.articles || []).map((a: CollectedArticle) => ({
            ...a,
            coverImage: a.cover_image,
            wordCount: a.word_count,
            estimatedTime: a.estimated_time,
            createdAt: a.created_at,
            progress: a.status === 'completed' ? 100 : 60
          }));
          setCollectedArticles(normalized);
        }
      } catch (error) {
        console.error('Failed to fetch collected articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCollectedArticles();
  }, []);

  const articles: Article[] = MOCK_ARTICLES;

  const filteredArticles = useMemo(() => {
    return collectedArticles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === '所有状态' || statusMap[article.status] === statusFilter;
      
      let matchesCategory = true;
      if (activeCategory !== '全部') {
        const cat = categories.find(c => c.name === activeCategory);
        matchesCategory = article.source === cat?.sourceKey;
      }
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchQuery, statusFilter, activeCategory, collectedArticles]);

  return (
    <div className="flex h-full overflow-hidden bg-slate-50/30">
      {/* Main Content Pane */}
      <div className={`flex-1 flex flex-col h-full transition-all duration-500 overflow-y-auto no-scrollbar ${showAssistant ? 'mr-0' : ''}`}>
        <div className="max-w-6xl mx-auto p-6 md:p-10 w-full animate-in fade-in duration-700">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                内容矩阵
                {!showAssistant && (
                  <button 
                    onClick={() => setShowAssistant(true)}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all animate-pulse"
                  >
                    <FourPointStar size={18} />
                  </button>
                )}
              </h1>
              <p className="text-slate-500 font-medium">智能识别并分类你的全平台思维触角。</p>
            </div>
            <button className="bg-slate-900 hover:bg-black text-white font-black px-8 py-4 rounded-[22px] flex items-center gap-3 shadow-xl shadow-slate-200 transition-all active:scale-95 self-start">
              <Plus size={20} /> 添加新维度
            </button>
          </header>

          {/* Tools & Tabs */}
          <div className="space-y-8 mb-10">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-md group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={18} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索标题、作者或核心观点..." 
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[24px] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium"
                  />
                </div>
                <div className="relative">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 px-8 py-4 rounded-[24px] text-sm font-black text-slate-600 focus:outline-none focus:border-indigo-500 cursor-pointer pr-12 transition-all"
                  >
                    <option>所有状态</option>
                    <option>等待处理</option>
                    <option>已解析</option>
                    <option>挑战已生成</option>
                    <option>已读完</option>
                  </select>
                  <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-[20px] border border-slate-200/50">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-[16px] transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <Grid2X2 size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-[16px] transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[22px] text-xs font-black transition-all border whitespace-nowrap active:scale-95 ${
                    activeCategory === cat.name 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 translate-y-[-2px]' 
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCategory === cat.name ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                    {cat.name === '全部' ? articles.length : articles.filter(a => (activeCategory === '公众号' ? a.source === 'Medium' : a.source === cat.sourceKey)).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
            {filteredArticles.map(article => (
              <div 
                key={article.id} 
                onClick={() => onSelectArticle(article.id)}
                className={`group bg-white border border-slate-200 transition-all cursor-pointer relative ${
                  viewMode === 'grid' 
                  ? "rounded-[40px] overflow-hidden hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-2" 
                  : "rounded-[24px] p-5 flex items-center gap-8 hover:border-indigo-300"
                }`}
              >
                <div className={`${viewMode === 'grid' ? 'h-56 w-full' : 'w-24 h-24 shrink-0 rounded-2xl overflow-hidden'} bg-slate-100 relative`}>
                  <img
                    src={article.coverImage || article.cover_image || '/hero.png'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = '/hero.png'; }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black uppercase text-indigo-600 shadow-sm">
                      {article.source}
                    </span>
                  </div>
                </div>

                <div className={`${viewMode === 'grid' ? 'p-8' : 'flex-1'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{article.estimatedTime} MINS</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{article.wordCount} WORDS</span>
                    </div>
                  </div>
                  
                  <h3 className={`font-black text-slate-900 mb-6 group-hover:text-indigo-600 transition-colors leading-tight ${viewMode === 'grid' ? 'text-xl line-clamp-2' : 'text-2xl'}`}>
                    {article.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                    <div className="flex-1 max-w-[120px] h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${article.progress}%` }} />
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                      article.status === 'completed' ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 bg-slate-50'
                    }`}>
                      {statusMap[article.status]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar Assistant */}
      {showAssistant && (
        <MindAssistant 
          articles={articles}
          onClose={() => setShowAssistant(false)} 
        />
      )}
    </div>
  );
};

// --- Assistant Component ---
interface MindAssistantProps {
  articles: Article[];
  onClose: () => void;
}

const MindAssistant: React.FC<MindAssistantProps> = ({ articles, onClose }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "你好！我是你的知识管家。我已经分析了你收藏的这几篇文章，我们可以探讨其中的联系或进行深度总结。" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user' as const, content: messageText }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      const context = articles.map(a => `- ${a.title} (来自 ${a.source})`).join('\n');

      if (!apiKey) {
        const offline = [
          "检测到未配置 GEMINI_API_KEY，启用本地离线总结模式。",
          "以下是基于已收藏文章的简要洞察：",
          context,
          "",
          "建议：在项目根目录创建 .env.local 并设置 GEMINI_API_KEY，以启用云端深度分析。"
        ].join('\n');
        setMessages([...newMessages, { role: 'assistant', content: offline }]);
      } else {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ role: 'user', parts: [{ text: messageText }] }],
          config: {
            systemInstruction: `你是一个专业的阅读助理。用户目前收藏了以下文章：\n${context}\n
            请基于这些文章回答用户的问题。如果问题涉及文章之外的知识，请结合你的专业背景进行延伸。语气要富有启发性、简洁且有洞察力。`,
          }
        });
        setMessages([...newMessages, { role: 'assistant', content: response.text || "我正在思考这个问题，请稍等..." }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "网络稍微有点波动，我无法连接到思维矩阵。请重试。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoice = () => {
    setIsRecording(true);
    // Simulate speech recognition
    setTimeout(() => {
      setIsRecording(false);
      const mockResult = "帮我总结一下这些文章的共同点";
      handleSend(mockResult);
    }, 2500);
  };

  return (
    <div className="w-full md:w-[420px] bg-white border-l border-slate-200 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500 z-40">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
             <FourPointStar size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm">思维博弈助理</h3>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Insight Mode</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-[28px] ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 rounded-br-none' 
                : 'bg-slate-50 text-slate-700 rounded-bl-none border border-slate-100'
            }`}>
              <p className="text-[14px] font-medium leading-relaxed">{msg.content}</p>
              {msg.role === 'assistant' && (
                <div className="mt-3 flex gap-2">
                  <button className="p-1.5 hover:bg-white rounded-lg text-slate-400"><Volume2 size={14} /></button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-slate-50 p-5 rounded-[28px] rounded-bl-none border border-slate-100 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-600" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">正在深度链接...</span>
             </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-50">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
             {['总结今日所学', '寻找知识关联', '生成测试挑战'].map(chip => (
               <button 
                key={chip}
                onClick={() => handleSend(chip)}
                className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black whitespace-nowrap hover:bg-indigo-50 hover:text-indigo-600 transition-all"
               >
                 {chip}
               </button>
             ))}
          </div>

          <div className={`flex items-center gap-3 p-3 bg-slate-50 border rounded-[28px] transition-all ${isRecording ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/5'}`}>
            <button 
              onClick={startVoice}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200' : 'bg-white text-slate-400 hover:text-indigo-600 hover:shadow-md'}`}
            >
              <Mic size={20} fill={isRecording ? "white" : "none"} />
            </button>
            
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? "正在听取..." : "向助理提问..."}
              className="flex-1 bg-transparent border-none outline-none text-slate-900 font-medium placeholder:text-slate-400 text-sm"
            />

            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${input.trim() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-200 text-slate-400 opacity-50'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryView;
