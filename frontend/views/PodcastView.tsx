import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Mic2, 
  Settings2, 
  Volume2, 
  Gauge, 
  Sparkles,
  Headphones,
  BookOpen,
  BrainCircuit,
  Wand2
} from 'lucide-react';
import { Article, KnowledgeCard } from '../types';

// Mock Data for Demo
const MOCK_PODCASTS = [
  {
    id: '1',
    title: '蔡格尼克效应的心理学原理',
    duration: '01:15',
    summary: '蔡格尼克效应揭示了人类对未完成任务的执念。本期播客将带你深入探讨这一心理机制，并结合 Quiz 挑战你的认知盲区。核心观点：未完成的任务会占据我们的认知带宽。',
    script: [
      { role: 'host', text: '大家好，欢迎来到 Read AI 每日洞察。今天我们要聊的是“蔡格尼克效应”。' },
      { role: 'ai', text: '简单来说，就是为什么你总是忘不了那些没做完的事。' },
      { role: 'host', text: '没错，研究发现未完成的任务会持续占用我们的短期记忆。' },
      { role: 'ai', text: '听完这段，来个小挑战：你觉得这种效应对拖延症是好是坏？' }
    ],
    relatedCardId: 'card-1'
  },
  {
    id: '2',
    title: 'AI 如何重塑人类的好奇心',
    duration: '01:30',
    summary: 'AI 时代，我们的好奇心是被喂养了还是被扼杀了？本期播客解析技术与认知的博弈。',
    script: [
      { role: 'host', text: 'AI 给了我们所有答案，那我们还需要提问吗？' },
      { role: 'ai', text: '这是个好问题。实际上，AI 可能会让我们更专注于提出高质量的问题。' }
    ],
    relatedCardId: 'card-2'
  }
];

const MOCK_CARDS: KnowledgeCard[] = [
  {
    id: 'card-1',
    originalContent: '蔡格尼克效应：人们对未完成任务的记忆优于已完成任务。',
    reflection: '利用这一效应，我可以先把大任务拆解开头，利用“未完成感”驱动自己继续。',
    tags: ['心理学', '效率'],
    createdAt: '2023-10-24',
    articleTitle: '蔡格尼克效应的心理学原理'
  }
];

const PodcastView: React.FC = () => {
  const [activePodcast, setActivePodcast] = useState(MOCK_PODCASTS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [voice, setVoice] = useState<'calm' | 'energetic' | 'deep'>('calm');
  const [showControls, setShowControls] = useState(false);
  
  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return p + (0.5 * speed); // Adjust speed
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const formatTime = (percent: number, totalDurationStr: string) => {
    const [min, sec] = totalDurationStr.split(':').map(Number);
    const totalSeconds = min * 60 + sec;
    const currentSeconds = Math.floor((percent / 100) * totalSeconds);
    const m = Math.floor(currentSeconds / 60);
    const s = currentSeconds % 60;
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-50/50 overflow-hidden">
      {/* Left Sidebar: Playlist */}
      <div className="w-full md:w-80 bg-white border-r border-slate-100 flex flex-col z-10">
        <div className="p-6 border-b border-slate-50">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <Headphones size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">AI 播客生成</h2>
          </div>
          <p className="text-xs text-slate-500 pl-1">多模态知识胶囊 • 1分钟精华</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {MOCK_PODCASTS.map(pod => (
            <div 
              key={pod.id}
              onClick={() => { setActivePodcast(pod); setProgress(0); setIsPlaying(true); }}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                activePodcast.id === pod.id 
                  ? 'bg-rose-50 border-rose-100 shadow-sm' 
                  : 'bg-white border-slate-100 hover:border-rose-100 hover:bg-slate-50/50'
              }`}
            >
              <h3 className={`font-bold text-sm mb-1 ${activePodcast.id === pod.id ? 'text-rose-700' : 'text-slate-700'}`}>
                {pod.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><ClockIcon size={10} /> {pod.duration}</span>
                <span className="flex items-center gap-1"><Sparkles size={10} /> AI 生成</span>
              </div>
            </div>
          ))}
          
          <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2 hover:border-rose-200 hover:bg-rose-50/30 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
              <Wand2 size={18} />
            </div>
            <span className="text-xs font-medium">生成新播客</span>
          </div>
        </div>
      </div>

      {/* Main Content: Player & Script */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header / Top Bar */}
        <div className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-sm flex items-center justify-between px-8">
           <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="font-medium text-slate-900">正在播放</span>
              <span className="text-slate-300">/</span>
              <span>{activePodcast.title}</span>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowControls(!showControls)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  showControls ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Settings2 size={14} />
                语音调节
              </button>
           </div>
        </div>

        {/* Controls Overlay (Voice & Speed) */}
        {showControls && (
          <div className="absolute top-16 right-8 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-5 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block flex items-center gap-2">
                  <Gauge size={12} /> 语速调节
                </label>
                <div className="flex gap-2">
                  {[0.75, 1.0, 1.25, 1.5].map(s => (
                    <button 
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        speed === s 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block flex items-center gap-2">
                  <Mic2 size={12} /> AI 声线
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'calm', label: '知性沉稳', desc: '适合深度阅读' },
                    { id: 'energetic', label: '活力激昂', desc: '适合通勤唤醒' },
                    { id: 'deep', label: '深邃磁性', desc: '适合晚间助眠' }
                  ].map(v => (
                    <button 
                      key={v.id}
                      onClick={() => setVoice(v.id as any)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
                        voice === v.id 
                          ? 'bg-indigo-50 border-indigo-200' 
                          : 'bg-white border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-xs font-bold ${voice === v.id ? 'text-indigo-700' : 'text-slate-700'}`}>{v.label}</span>
                      <span className="text-[10px] text-slate-400">{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 pb-32">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Waveform Visualization Placeholder */}
            <div className="bg-gradient-to-r from-rose-500 to-indigo-600 h-32 rounded-3xl shadow-lg flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-black/10"></div>
               <div className="flex items-center gap-1 h-12">
                 {[...Array(20)].map((_, i) => (
                   <div 
                      key={i} 
                      className="w-1.5 bg-white/80 rounded-full animate-pulse" 
                      style={{ 
                        height: isPlaying ? `${Math.random() * 100}%` : '20%',
                        animationDuration: `${0.5 + Math.random()}s`,
                        animationPlayState: isPlaying ? 'running' : 'paused'
                      }} 
                   />
                 ))}
               </div>
               <div className="absolute bottom-4 left-6 text-white text-xs font-medium tracking-wide flex items-center gap-2">
                  <span className="bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">AI 核心观点提取</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">+ Quiz 考点融合</span>
               </div>
            </div>

            {/* Script Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} />
                AI 播客脚本
              </h3>
              <div className="space-y-4">
                {activePodcast.script.map((line, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      line.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {line.role === 'ai' ? <BrainCircuit size={18} /> : <Volume2 size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-800 leading-relaxed text-[15px] group-hover:bg-slate-50 p-2 rounded-lg -ml-2 transition-colors">
                        {line.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Card Section */}
            <div className="pt-8 border-t border-slate-100">
               <div className="flex items-center gap-2 mb-4">
                 <BookOpen className="text-emerald-600" size={18} />
                 <h4 className="font-bold text-slate-700">关联AI 问答</h4>
               </div>
               {MOCK_CARDS.map(card => (
                 <div key={card.id} className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
                    <p className="text-slate-800 font-medium mb-3">“{card.originalContent}”</p>
                    <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold bg-white/50 w-fit px-2 py-1 rounded-md">
                       <BrainCircuit size={12} />
                       <span>{card.reflection}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Bottom Player Bar */}
        <div className="h-24 bg-white border-t border-slate-100 absolute bottom-0 w-full px-8 flex items-center justify-between z-30 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
           <div className="flex items-center gap-4 w-1/3">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                 <Headphones size={24} />
              </div>
              <div>
                 <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{activePodcast.title}</h4>
                 <p className="text-xs text-slate-500">AI Generated Podcast</p>
              </div>
           </div>

           <div className="flex flex-col items-center gap-2 w-1/3">
              <div className="flex items-center gap-6">
                 <button className="text-slate-400 hover:text-indigo-600 transition-colors"><SkipBack size={20} /></button>
                 <button 
                   onClick={togglePlay}
                   className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                 >
                   {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                 </button>
                 <button className="text-slate-400 hover:text-indigo-600 transition-colors"><SkipForward size={20} /></button>
              </div>
              <div className="w-full flex items-center gap-3 text-xs text-slate-400 font-medium font-mono">
                 <span>{formatTime(progress, activePodcast.duration)}</span>
                 <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden cursor-pointer">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                 </div>
                 <span>{activePodcast.duration}</span>
              </div>
           </div>

           <div className="w-1/3 flex justify-end items-center gap-4">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 border border-slate-100">
                  <Gauge size={14} className="text-indigo-500" />
                  <span>{speed}x</span>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ClockIcon = ({ size }: { size: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default PodcastView;
