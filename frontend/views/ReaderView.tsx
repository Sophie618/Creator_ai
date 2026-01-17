
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Loader2,
  Layout,
  ArrowRight,
  CheckCircle2,
  Hash,
  Network,
  RefreshCw,
  MessageSquare,
  Type as TypeIcon,
  Sun,
  Moon,
  Palette,
  Share2,
  X,
  Sparkles,
  Quote
} from 'lucide-react';
import ShareCard from '../components/ShareCard';
import { GoogleGenAI, Type } from "@google/genai";

interface MindMapNode {
  title: string;
  children?: MindMapNode[];
  isExpanded?: boolean;
}

interface Keyword {
  text: string;
  weight: number; // 1-10
}

interface AnalysisResult {
  mindMap: MindMapNode[];
  keywords: Keyword[];
  summary: string;
}

interface ReaderViewProps {
  articleId: string;
  initialUrl?: string;
  onBack: () => void;
}

const ReaderView: React.FC<ReaderViewProps> = ({ articleId, initialUrl, onBack }) => {
  const [viewState, setViewState] = useState<'loading' | 'content' | 'quiz' | 'completed'>('loading');
  
  // 阅读偏好
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<'light' | 'parchment' | 'dark'>('light');
  
  // 文章数据
  const [articleData, setArticleData] = useState<{
    title: string;
    content: string;
    cleaned_content?: string;
    quiz_json?: string;
    source: string;
    cover_image?: string;
    url?: string;
  } | null>(null);

  const [showShareCard, setShowShareCard] = useState(false);
  const [opinions, setOpinions] = useState<any[]>([]);
  const [rantContent, setRantContent] = useState<string>(""); 
  const [isGeneratingRant, setIsGeneratingRant] = useState(false);

  // 分析相关状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ... (existing code)

  const handleRantClick = async () => {
     if (rantContent) {
         setShowShareCard(true);
         return;
     }

     setIsGeneratingRant(true);
     try {
         const response = await fetch('http://127.0.0.1:8000/api/generate-rant', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ url: articleData?.url || initialUrl || "" })
         });
         
         if (response.ok) {
             const data = await response.json();
             setRantContent(data.rant);
             setShowShareCard(true);
         } else {
             // Fallback
             setRantContent("AI 暂时无法生成暴论...");
             setShowShareCard(true);
         }
     } catch (e) {
         console.error("Failed to generate rant", e);
         setRantContent("网络连接错误");
         setShowShareCard(true);
     } finally {
         setIsGeneratingRant(false);
     }
  };
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const contentRef = useRef<HTMLDivElement>(null);

  // 1. 获取文章内容
  useEffect(() => {
    const fetchArticle = async (idOrUrl: string) => {
      setViewState('loading');
      try {
        const url = idOrUrl.startsWith('http') 
          ? `http://127.0.0.1:8000/api/article/url?url=${encodeURIComponent(idOrUrl)}`
          : `http://127.0.0.1:8000/api/article/${idOrUrl}`;
          
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setArticleData({
            title: data.title,
            content: data.content || "",
            cleaned_content: data.cleaned_content || data.content,
            quiz_json: data.quiz_json,
            source: data.source,
            cover_image: data.cover_image,
            url: data.url
          });

          // 解析暴论
          if (data.quiz_json) {
            try {
              const parsed = JSON.parse(data.quiz_json);
              setOpinions(parsed);
            } catch(e) {
              console.error("Error parsing opinions", e);
            }
          }
          setViewState('content');
        } else {
          console.error("Article not found in backend");
          setViewState('content'); 
        }
      } catch (err) {
        console.error("Failed to fetch article", err);
        setViewState('content');
      }
    };
    
    if (articleId) {
      fetchArticle(articleId);
    } else if (initialUrl) {
      fetchArticle(initialUrl);
    } else {
      // 没有任何标识，直接显示 content 状态防止白屏
      setViewState('content');
    }
  }, [articleId, initialUrl]);

  // 2. 自动触发分析
  useEffect(() => {
    if (viewState === 'content' && articleData?.content && !analysisData && !isAnalyzing) {
      performAnalysis(articleData.content);
    }
  }, [viewState, articleData]);

  // 执行 AI 分析逻辑
  const performAnalysis = async (content: string) => {
    setIsAnalyzing(true);
    try {
      // 安全地检查 API Key，避免 process.env 导致的浏览器报错
      const textToAnalyze = content || "";
      
      // 暂时回归 Mock 逻辑，除非明确配置了 API
      setAnalysisData({
        mindMap: [
          { title: "Scaling Law 的本质", children: [{ title: "能源到逻辑熵的转化" }, { title: "物理过程而非工程堆砌" }] },
          { title: "个人竞争策略", children: [{ title: "关注提问质量" }, { title: "计算成本下降的影响" }] },
          { title: "未来设计趋势", children: [{ title: "意图捕获与共鸣" }, { title: "UI 消失与服务化" }] }
        ],
        keywords: [
          { text: "Scaling Law", weight: 10 }, { text: "逻辑熵", weight: 8 }, { text: "能源竞争", weight: 7 },
          { text: "意图捕获", weight: 9 }, { text: "UI 消失", weight: 6 }, { text: "大模型", weight: 10 },
          { text: "物理定律", weight: 8 }, { text: "阅读定义", weight: 5 }, { text: "工程经验", weight: 4 },
          { text: "计算速度", weight: 7 }, { text: "提问质量", weight: 9 }, { text: "服务化", weight: 6 },
          { text: "共鸣", weight: 5 }, { text: "像素", weight: 3 }, { text: "未来设计", weight: 8 },
          { text: "产出成本", weight: 6 }, { text: "智能终局", weight: 9 }, { text: "重构", weight: 7 },
          { text: "捕获", weight: 4 }, { text: "逻辑序", weight: 6 }
        ],
        summary: "文章探讨了 Scaling Law 在物理层面的本质，并推导出未来设计将从像素转向意图的结论。"
      });
      return;

    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleNode = (title: string) => {
    setExpandedNodes(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const renderMindMap = (nodes: MindMapNode[], level = 0) => {
    return (
      <ul className={`space-y-3 ${level > 0 ? 'ml-6 border-l border-slate-100 pl-4' : ''}`}>
        {nodes.map((node, i) => (
          <li key={i} className="group">
            <div 
              className="flex items-center gap-2 py-1.5 cursor-pointer hover:translate-x-1 transition-transform"
              onClick={() => node.children && toggleNode(node.title)}
            >
              {node.children ? (
                expandedNodes[node.title] !== false ? <ChevronDown size={14} className="text-indigo-400" /> : <ChevronRight size={14} className="text-slate-300" />
              ) : (
                <div className="w-3.5 h-[2px] bg-slate-200" />
              )}
              <span className={`text-sm font-bold ${level === 0 ? 'text-slate-900' : 'text-slate-600'}`}>
                {node.title}
              </span>
            </div>
            {node.children && expandedNodes[node.title] !== false && renderMindMap(node.children, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  const renderLoading = () => (
    <div className={`flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-300 ${themeConfig[theme].bg}`}>
      <Loader2 className="text-indigo-500 animate-spin" size={40} strokeWidth={2} />
      <p className={`${themeConfig[theme].muted} text-sm font-bold tracking-widest uppercase`}>同步认知内容...</p>
    </div>
  );

  const themeConfig = {
    light: {
      bg: 'bg-[#f8f9fa]',
      card: 'bg-white',
      text: 'text-slate-900',
      muted: 'text-slate-500',
      border: 'border-slate-100',
      shadow: 'shadow-[0_24px_80px_rgba(0,0,0,0.06)]'
    },
    parchment: {
      bg: 'bg-[#f4ecd8]',
      card: 'bg-[#f4ecd8]',
      text: 'text-[#433422]',
      muted: 'text-[#6d5b46]',
      border: 'border-[#e8dfc4]',
      shadow: 'shadow-none'
    },
    dark: {
      bg: 'bg-[#121212]',
      card: 'bg-[#1e1e1e]',
      text: 'text-slate-200',
      muted: 'text-slate-500',
      border: 'border-slate-800',
      shadow: 'shadow-none'
    }
  };

  const getTitleStyle = (title: string = "") => {
    const len = title.length;
    // 动态计算字号：短标题大，长标题渐细，并设置合理的行高
    const size = Math.max(1.75, Math.min(3.5, 4.5 - len / 12));
    return { 
      fontSize: `${size}rem`, 
      lineHeight: 1.15,
      wordBreak: 'break-word' as const
    };
  };

  return (
    <div className={`flex h-screen ${themeConfig[theme].bg} ${themeConfig[theme].text} transition-colors duration-500 overflow-hidden relative`}>
      <main className="flex-1 relative z-10 h-full flex flex-col">
        {viewState === 'loading' ? renderLoading() : (
          <div className="flex-1 flex overflow-hidden">
            {/* 主内容区 - 采用阴影卡片设计 */}
            <div className="flex-1 overflow-y-auto relative scroll-smooth no-scrollbar p-6 md:p-12 lg:p-16" ref={contentRef}>
              
              {/* 阅读器控制栏 */}
              <div className="fixed top-8 right-8 z-50 flex items-center gap-4 p-2 transition-all">
                <button 
                  onClick={handleRantClick}
                  disabled={isGeneratingRant}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 text-xs font-black tracking-widest uppercase group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGeneratingRant ? (
                    <Loader2 size={16} className="text-indigo-200 animate-spin" />
                  ) : (
                    <Sparkles size={16} className="text-indigo-200 group-hover:rotate-12 transition-transform" />
                  )}
                  {isGeneratingRant ? "生成中..." : "AI 暴论"}
                </button>

                <div className="flex items-center gap-2 p-1 bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1">
                    <button 
                      onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <TypeIcon size={14} />
                    </button>
                    <span className="text-[10px] font-black w-6 text-center">{fontSize}</span>
                    <button 
                      onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <TypeIcon size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      <Sun size={18} />
                    </button>
                    <button 
                      onClick={() => setTheme('parchment')}
                      className={`p-2 rounded-lg transition-all ${theme === 'parchment' ? 'bg-[#e8dfc4] text-[#433422]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      <Palette size={18} />
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      <Moon size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 悬浮返回按钮 */}
              <button 
                onClick={onBack} 
                className={`fixed top-8 left-8 z-50 p-3 ${themeConfig[theme].card} hover:opacity-80 rounded-2xl ${themeConfig[theme].border} shadow-sm border transition-all hover:scale-110 active:scale-95 group`}
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div className="max-w-3xl mx-auto">
                <article className={`${themeConfig[theme].card} rounded-[48px] ${themeConfig[theme].shadow} ${themeConfig[theme].border} border overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000`}>
                  {/* 文章头图/顶栏装饰 */}
                  <div className="h-2 bg-indigo-600 w-full" />
                  
                  <div className="py-16 px-8 md:px-16 lg:px-20 space-y-12">
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-black rounded-lg tracking-[0.1em] uppercase border border-indigo-100 dark:border-indigo-800">AI Deep Reading</span>
                        <span className="text-slate-200">/</span>
                        <span className={`${themeConfig[theme].muted} text-[10px] font-black uppercase tracking-widest`}>{articleData?.source || 'Original Source'}</span>
                      </div>
                      <h1 
                        className="font-black tracking-tighter serif"
                        style={getTitleStyle(articleData?.title)}
                      >
                        {articleData?.title || '正在解析标题...'}
                      </h1>
                    </div>
                    
                    <div 
                      className={`reading-content ${theme === 'dark' ? 'prose-invert' : ''} max-w-none serif`}
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {(articleData?.cleaned_content || articleData?.content) ? (
                        (() => {
                          const rawContent = articleData.cleaned_content || articleData.content || "";
                          // 1. 处理常见的各种换行符，统一转为 \n
                          let sanitized = rawContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                          
                          // 2. 检查是否完全没有换行（如果全文很长但没有一个换行，尝试强制分段）
                          if (!sanitized.includes('\n') && sanitized.length > 500) {
                             // 按照句号分段，大致每 3-4 个句号分一段
                             sanitized = sanitized.replace(/([。！？；]|\.\s)/g, "$1\n\n");
                          }

                          return sanitized
                            .split('\n')
                            .map(p => p.trim())
                            .filter(p => p.length > 0)
                            .map((p, i) => (
                              <p key={i} className={i === 0 ? 'drop-cap' : ''}>
                                {p}
                              </p>
                            ));
                        })()
                      ) : (
                        <p className="text-slate-400 italic">正在提取正文内容...</p>
                      )}
                    </div>

                    <div className="pt-24 pb-8 flex flex-col items-center text-center gap-10">
                       <div className="w-24 h-24 bg-slate-900 dark:bg-indigo-600 rounded-[36px] flex items-center justify-center text-white shadow-2xl shadow-slate-200 dark:shadow-indigo-900/20 group cursor-pointer hover:scale-105 transition-all">
                          <CheckCircle2 size={40} strokeWidth={1.5} />
                       </div>
                       <div className="space-y-3">
                         <h4 className="text-3xl font-black">恭喜，完成深读</h4>
                         <p className={`${themeConfig[theme].muted} font-bold`}>您已成功同步本篇文章的核心认知。快试试右上角的AI暴论🤩！</p>
                       </div>
                    </div>
                  </div>
                </article>

              </div>
            </div>
          </div>
        )}
      </main>
      {showShareCard && (
        <ShareCard 
          onClose={() => setShowShareCard(false)}
          title={rantContent || articleData?.title}
          defaultCover={articleData?.cover_image}
          qrCodeUrl={articleData?.url}
        />
      )}
    </div>
  );
};

export default ReaderView;
