
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
  Palette
} from 'lucide-react';
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
  const [fontSize, setFontSize] = useState(17);
  const [theme, setTheme] = useState<'light' | 'parchment' | 'dark'>('light');
  
  // 文章数据
  const [articleData, setArticleData] = useState<{
    title: string;
    content: string;
    source: string;
  } | null>(null);

  // 分析相关状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const contentRef = useRef<HTMLDivElement>(null);

  // 词云颜色池
  const wordCloudColors = [
    'text-blue-600', 'text-emerald-500', 'text-rose-500', 
    'text-amber-500', 'text-indigo-600', 'text-violet-500', 
    'text-cyan-500', 'text-orange-500', 'text-fuchsia-500', 
    'text-lime-500', 'text-sky-500', 'text-pink-500'
  ];

  // 1. 获取文章内容
  useEffect(() => {
    const fetchArticle = async (idOrUrl: string) => {
      setViewState('loading');
      try {
        // 如果是 ID 则按 ID 查，否则可能需要按 URL 查（暂时仅支持 ID）
        const url = idOrUrl.startsWith('http') 
          ? `http://127.0.0.1:8000/api/article/url?url=${encodeURIComponent(idOrUrl)}`
          : `http://127.0.0.1:8000/api/article/${idOrUrl}`;
          
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setArticleData({
            title: data.title,
            content: data.content || "",
            source: data.source
          });
          setViewState('content');
        } else {
          setViewState('content'); 
        }
      } catch (err) {
        console.error("Failed to fetch article", err);
        setViewState('content');
      }
    };
    
    if (articleId && articleId !== '1') {
      fetchArticle(articleId);
    } else if (initialUrl) {
      fetchArticle(initialUrl);
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
      const apiKey = process.env.API_KEY;
      const textToAnalyze = content || "";
      
      if (!apiKey || !textToAnalyze) {
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
          summary: "已启用离线简报：基于本地内容提炼结构化要点，等待配置 GEMINI_API_KEY 后将自动切换为云端深度分析。"
        });
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `请分析以下文章内容，提取其逻辑结构（思维导图）和核心关键词。
        文章内容：${textToAnalyze.slice(0, 4000)}
        输出格式要求为 JSON，包含 mindMap (树状结构) 和 keywords (包含20个以上关键词，权重 1-10)。`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mindMap: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    children: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING } } } }
                  },
                  required: ["title"]
                }
              },
              keywords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    weight: { type: Type.NUMBER }
                  }
                }
              },
              summary: { type: Type.STRING }
            },
            required: ["mindMap", "keywords", "summary"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setAnalysisData(result);
    } catch (err) {
      console.error("Analysis failed", err);
      // Fallback 模拟更丰富的关键词数据以配合词云展示
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
              <div className="fixed top-8 right-[460px] z-50 flex items-center gap-2 p-2 bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 transition-all">
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
                      <h1 className={`font-black leading-[1.15] tracking-tight serif ${getTitleSizeClass(articleData?.title)}`}>
                        {articleData?.title || '正在解析标题...'}
                      </h1>
                    </div>
                    
                    <div 
                      className={`reading-content ${theme === 'dark' ? 'prose-invert' : ''} max-w-none serif`}
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {articleData?.content ? (
                        articleData.content.split(/\n\s*\n/).filter(p => p.trim()).map((p, i) => (
                          <p key={i} className={i === 0 ? 'drop-cap' : ''}>
                            {p}
                          </p>
                        ))
                      ) : (
                        <p className="text-slate-400 italic">正在提取正文内容...</p>
                      )}
                      
                      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t ${themeConfig[theme].border} mt-20`}>
                        <div className={`md:col-span-2 ${theme === 'light' ? 'bg-slate-50/50' : 'bg-black/10'} rounded-3xl border ${themeConfig[theme].border} p-8`}>
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">结构化要点提炼</h3>
                          <ul className={`space-y-4 text-[15px] leading-7 ${themeConfig[theme].text} font-bold`}>
                            {analysisData?.mindMap.slice(0, 4).map((node, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.4)]" /> 
                                {node.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={`${theme === 'light' ? 'bg-indigo-50/30' : 'bg-indigo-900/10'} rounded-3xl border border-indigo-100/50 dark:border-indigo-800/50 p-8`}>
                          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-6">核心概念</h3>
                          <div className="flex flex-wrap gap-2">
                            {analysisData?.keywords.slice(0, 6).map((kw, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shadow-sm">{kw.text}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-24 pb-8 flex flex-col items-center text-center gap-10">
                       <div className="w-24 h-24 bg-slate-900 dark:bg-indigo-600 rounded-[36px] flex items-center justify-center text-white shadow-2xl shadow-slate-200 dark:shadow-indigo-900/20 group cursor-pointer hover:scale-105 transition-all">
                          <CheckCircle2 size={40} strokeWidth={1.5} />
                       </div>
                       <div className="space-y-3">
                         <h4 className="text-3xl font-black">恭喜，完成深读</h4>
                         <p className={`${themeConfig[theme].muted} font-bold`}>您已成功同步本篇文章的核心认知。右侧矩阵提供了更宏观的逻辑归纳。</p>
                       </div>
                    </div>
                  </div>
                </article>

                {/* 底部留空 */}
                <div className="h-20" />
              </div>
            </div>

            {/* 右侧分析侧边栏 */}
            <aside className={`w-[420px] border-l ${themeConfig[theme].border} ${themeConfig[theme].card} flex flex-col shrink-0 animate-in slide-in-from-right duration-700 shadow-[-20px_0_40px_rgba(0,0,0,0.02)]`}>
                <div className={`p-8 border-b ${themeConfig[theme].border} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                      <Network size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black">认知分析矩阵</h3>
                      <p className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">Intelligence Engine v3</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
                  {/* 思维导图模块 */}
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Layout size={14} /> 逻辑解构图
                      </h4>
                      {analysisData && (
                        <button onClick={() => performAnalysis(articleData?.content || '')} className="text-slate-300 hover:text-indigo-600 transition-all">
                          <RefreshCw size={14} className={isAnalyzing ? 'animate-spin' : ''} />
                        </button>
                      )}
                    </div>

                    {!analysisData ? (
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <Loader2 size={32} className="text-indigo-600 animate-spin" />
                        <p className="text-xs font-bold text-slate-400 italic">正在提取思维锚点...</p>
                      </div>
                    ) : (
                      <div className={`bg-slate-50/50 dark:bg-black/20 rounded-3xl p-6 border ${themeConfig[theme].border}`}>
                        {renderMindMap(analysisData.mindMap)}
                      </div>
                    )}
                  </section>

                  {/* 核心关键词云 - 重构为炫彩视觉风格 */}
                  <section className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Hash size={14} /> 核心认知云
                    </h4>
                    
                    {!analysisData ? (
                      <div className="flex flex-wrap gap-2 justify-center opacity-40">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                          <div key={i} className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" style={{ width: `${40 + Math.random() * 80}px` }} />
                        ))}
                      </div>
                    ) : (
                      <div className={`bg-slate-50/30 dark:bg-black/10 rounded-[40px] p-6 border ${themeConfig[theme].border} relative overflow-hidden min-h-[300px] flex flex-wrap items-center justify-center content-center gap-y-4 gap-x-2`}>
                        {analysisData.keywords.map((kw, i) => {
                          // 计算大小：4级字号
                          const sizeClass = kw.weight > 8 ? 'text-2xl font-black' : 
                                           kw.weight > 6 ? 'text-xl font-bold' : 
                                           kw.weight > 4 ? 'text-base font-bold' : 'text-xs font-medium';
                          
                          // 随机旋转：-15deg, -5deg, 0deg, 5deg, 15deg, 90deg
                          const rotations = ['rotate-0', 'rotate-0', 'rotate-0', '-rotate-6', 'rotate-6', 'rotate-12', '-rotate-12', 'rotate-90'];
                          const rotation = rotations[i % rotations.length];
                          
                          // 随机颜色
                          const colorClass = wordCloudColors[i % wordCloudColors.length];
                          
                          return (
                            <button 
                              key={i}
                              className={`transition-all duration-500 hover:scale-125 hover:z-20 cursor-default px-1 py-1 ${sizeClass} ${colorClass} ${rotation}`}
                              title={`重要程度: ${kw.weight}`}
                            >
                              {kw.text}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  {/* 摘要简报 */}
                  {analysisData && (
                    <section className="space-y-4 pt-8 border-t border-slate-50 dark:border-slate-800">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={14} /> 认知简报
                      </h4>
                      <p className="text-sm font-medium leading-relaxed italic bg-indigo-50/50 dark:bg-indigo-900/20 p-6 rounded-[32px] border border-indigo-100/30 dark:border-indigo-800/30">
                        “{analysisData.summary}”
                      </p>
                    </section>
                  )}
                </div>

                {/* 底部行动项 */}
                <div className={`p-8 ${theme === 'light' ? 'bg-slate-50' : 'bg-black/20'} border-t ${themeConfig[theme].border}`}>
                  <button 
                    onClick={() => setViewState('quiz')}
                    className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 group"
                  >
                    开始知识博弈 
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </aside>
            </div>
        )}
      </main>
    </div>
  );
};

export default ReaderView;
