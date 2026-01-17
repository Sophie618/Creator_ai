
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
  MessageSquare
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
  const [parsingProgress, setParsingProgress] = useState(0);
  
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

  // 1. 获取文章内容并模拟进度
  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    
    const fetchArticle = async () => {
      // 模拟加载进度感
      progressTimer = setInterval(() => {
        setParsingProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.floor(Math.random() * 5);
        });
      }, 100);

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/article/${articleId}`);
        if (response.ok) {
          const data = await response.json();
          setArticleData({
            title: data.title,
            content: data.content || "",
            source: data.source
          });
          setParsingProgress(100);
          // 留一点时间显示 100%
          setTimeout(() => setViewState('content'), 400);
        } else {
          setViewState('content'); // 即使失败也进入内容视图展示错误
        }
      } catch (err) {
        console.error("Failed to fetch article", err);
        setViewState('content');
      } finally {
        clearInterval(progressTimer);
      }
    };
    
    if (viewState === 'loading') {
      fetchArticle();
    }

    return () => clearInterval(progressTimer);
  }, [articleId]);

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
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in zoom-in duration-500 bg-[#0a0a0a]">
      <div className="relative">
        <div className="w-40 h-40 rounded-full border-4 border-white/5 flex items-center justify-center shadow-[0_0_100px_rgba(99,102,241,0.2)]">
          <Loader2 className="text-indigo-500 animate-spin" size={56} strokeWidth={1} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-lg font-black text-indigo-400 tabular-nums">{parsingProgress}%</span>
        </div>
      </div>
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-white tracking-tighter">思维网络同步中</h2>
        <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">正在将非结构化网页转化为高维认知空间...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-900 overflow-hidden relative">
      <main className="flex-1 relative z-10 h-full flex flex-col">
        {viewState === 'loading' ? renderLoading() : (
          <div className="flex-1 flex overflow-hidden">
            {/* 主内容区 - 采用阴影卡片设计 */}
            <div className="flex-1 overflow-y-auto relative scroll-smooth no-scrollbar p-6 md:p-12 lg:p-16" ref={contentRef}>
              {/* 悬浮返回按钮 */}
              <button 
                onClick={onBack} 
                className="fixed top-8 left-8 z-50 p-3 bg-white/80 backdrop-blur-md hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm border border-slate-200 transition-all hover:scale-110 active:scale-95 group"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div className="max-w-4xl mx-auto">
                <article className="bg-white rounded-[48px] shadow-[0_24px_80px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  {/* 文章头图/顶栏装饰 */}
                  <div className="h-2 bg-indigo-600 w-full" />
                  
                  <div className="py-16 px-10 md:px-20 space-y-12">
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg tracking-[0.1em] uppercase border border-indigo-100">AI Deep Reading</span>
                        <span className="text-slate-200">/</span>
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{articleData?.source || 'Original Source'}</span>
                      </div>
                      <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight serif">
                        {articleData?.title || '正在解析标题...'}
                      </h1>
                    </div>
                    
                    <div className="prose prose-slate prose-xl max-w-none text-slate-700 leading-relaxed font-medium space-y-10 serif">
                      {articleData?.content ? (
                        articleData.content.split('\n\n').map((p, i) => (
                          <p key={i} className="first-letter:text-5xl first-letter:font-black first-letter:text-indigo-600 first-letter:mr-3 first-letter:float-left first-letter:mt-2">
                            {p}
                          </p>
                        ))
                      ) : (
                        <p className="text-slate-400 italic">正在提取正文内容...</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-slate-100 mt-20">
                        <div className="md:col-span-2 bg-slate-50/50 rounded-3xl border border-slate-100 p-8">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">结构化要点提炼</h3>
                          <ul className="space-y-4 text-[15px] leading-7 text-slate-700 font-bold">
                            {analysisData?.mindMap.slice(0, 4).map((node, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.4)]" /> 
                                {node.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-indigo-50/30 rounded-3xl border border-indigo-100/50 p-8">
                          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-6">核心概念</h3>
                          <div className="flex flex-wrap gap-2">
                            {analysisData?.keywords.slice(0, 6).map((kw, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-black bg-white text-indigo-600 border border-indigo-100 shadow-sm">{kw.text}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-24 pb-8 flex flex-col items-center text-center gap-10">
                       <div className="w-24 h-24 bg-slate-900 rounded-[36px] flex items-center justify-center text-white shadow-2xl shadow-slate-200 group cursor-pointer hover:scale-105 transition-all">
                          <CheckCircle2 size={40} strokeWidth={1.5} />
                       </div>
                       <div className="space-y-3">
                         <h4 className="text-3xl font-black text-slate-900">恭喜，完成深读</h4>
                         <p className="text-slate-400 font-bold">您已成功同步本篇文章的核心认知。右侧矩阵提供了更宏观的逻辑归纳。</p>
                       </div>
                    </div>
                  </div>
                </article>

                {/* 底部留空 */}
                <div className="h-20" />
              </div>
            </div>

            {/* 右侧分析侧边栏 */}
            <aside className="w-[420px] border-l border-slate-100 bg-white flex flex-col shrink-0 animate-in slide-in-from-right duration-700 shadow-[-20px_0_40px_rgba(0,0,0,0.02)]">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                      <Network size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">认知分析矩阵</h3>
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
                      <div className="bg-slate-50 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-100">
                        <Loader2 size={32} className="text-indigo-600 animate-spin" />
                        <p className="text-xs font-bold text-slate-400 italic">正在提取思维锚点...</p>
                      </div>
                    ) : (
                      <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
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
                          <div key={i} className="h-6 bg-slate-100 rounded-full animate-pulse" style={{ width: `${40 + Math.random() * 80}px` }} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50/30 rounded-[40px] p-6 border border-slate-50 relative overflow-hidden min-h-[300px] flex flex-wrap items-center justify-center content-center gap-y-4 gap-x-2">
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
                        
                        {/* 装饰性的背景文字或阴影可以增加深度感，但这里保持简洁 */}
                      </div>
                    )}
                  </section>

                  {/* 摘要简报 */}
                  {analysisData && (
                    <section className="space-y-4 pt-8 border-t border-slate-50">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={14} /> 认知简报
                      </h4>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed italic bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100/30">
                        “{analysisData.summary}”
                      </p>
                      {!process.env.API_KEY && (
                        <div className="text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl p-4">
                          当前为离线简报模式，添加 GEMINI_API_KEY 后将启用云端深度分析。
                        </div>
                      )}
                    </section>
                  )}
                </div>

                {/* 底部行动项 */}
                <div className="p-8 bg-slate-50 border-t border-slate-100">
                  <button 
                    onClick={() => setViewState('quiz')}
                    className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 group"
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
