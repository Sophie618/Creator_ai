
import React, { useState, useMemo, useRef } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Zap, 
  Brain, 
  Target, 
  Award, 
  Calendar, 
  Flame,
  ChevronRight,
  Clock,
  Rocket,
  Compass,
  Star,
  Activity,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Info
} from 'lucide-react';

// --- 类型定义 ---
interface HeatmapData {
  date: string;
  value: number;
}

interface RankingItem {
  id: string;
  name: string;
  value: number;
  secondaryValue: string;
  trend: number;
}

// --- 模拟数据生成器 ---
const generateHeatmapData = (): HeatmapData[] => {
  const data: HeatmapData[] = [];
  const today = new Date();
  for (let i = 0; i < 182; i++) { // 26 weeks
    const d = new Date();
    d.setDate(today.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 5) // 0 to 4 intensity
    });
  }
  return data.reverse();
};

const TOPICS_DATA: RankingItem[] = [
  { id: '1', name: '深度学习', value: 92, secondaryValue: '45h', trend: 12 },
  { id: '2', name: '心理学原理', value: 88, secondaryValue: '38h', trend: 5 },
  { id: '3', name: '系统思维', value: 85, secondaryValue: '30h', trend: 18 },
  { id: '4', name: '博弈论', value: 82, secondaryValue: '28h', trend: -2 },
  { id: '5', name: 'UX 设计', value: 78, secondaryValue: '25h', trend: 8 },
  { id: '6', name: '量子物理', value: 75, secondaryValue: '22h', trend: 20 },
  { id: '7', name: '宏观经济', value: 72, secondaryValue: '20h', trend: 4 },
  { id: '8', name: '语言学', value: 68, secondaryValue: '18h', trend: -5 },
  { id: '9', name: '近代史', value: 65, secondaryValue: '15h', trend: 2 },
  { id: '10', name: '神经科学', value: 62, secondaryValue: '12h', trend: 15 },
  { id: '11', name: '社会学', value: 60, secondaryValue: '10h', trend: 1 },
  { id: '12', name: '古典音乐', value: 58, secondaryValue: '8h', trend: 0 },
];

const LearningData: React.FC = () => {
  // 状态管理
  const [hoveredCell, setHoveredCell] = useState<HeatmapData | null>(null);
  const [heatmapTheme, setHeatmapTheme] = useState<'indigo' | 'emerald' | 'amber'>('indigo');
  const [radarSeries, setRadarSeries] = useState(['User', 'Average']);
  const [rankingSort, setRankingSort] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const heatmapData = useMemo(() => generateHeatmapData(), []);
  
  // 排行榜逻辑
  const sortedRanking = useMemo(() => {
    return [...TOPICS_DATA].sort((a, b) => 
      rankingSort === 'desc' ? b.value - a.value : a.value - b.value
    );
  }, [rankingSort]);

  const paginatedRanking = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedRanking.slice(start, start + itemsPerPage);
  }, [sortedRanking, currentPage]);

  const totalPages = Math.ceil(TOPICS_DATA.length / itemsPerPage);

  // 导出功能模拟
  const handleExport = (format: 'png' | 'svg', elementId: string) => {
    console.log(`Exporting ${elementId} as ${format}...`);
    alert(`正在导出 ${elementId} 为 ${format.toUpperCase()}，请稍候...`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">学习报告</h1>
          <p className="text-slate-500 font-medium text-lg">基于 1,248 分钟的沉浸式数据分析。</p>
        </div>
        <div className="flex gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button className="px-6 py-2.5 bg-white text-indigo-600 text-sm font-black rounded-xl shadow-sm">本月</button>
          <button className="px-6 py-2.5 text-slate-500 hover:text-slate-900 text-sm font-black rounded-xl transition-all">年度</button>
          <button className="px-6 py-2.5 text-slate-500 hover:text-slate-900 text-sm font-black rounded-xl transition-all">全部数据</button>
        </div>
      </header>

      {/* 核心统计卡片（置于学习报告下方） */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DataCard icon={<Clock className="text-indigo-600" />} title="本月累计时长" value="1,248" unit="分钟" trend="+12% 较上周" />
        <DataCard icon={<Activity className="text-emerald-600" />} title="专注指数 P90" value="88.5" unit="分" trend="极高水平" />
        <DataCard icon={<Zap className="text-amber-600" />} title="博弈挑战胜率" value="94.2" unit="%" trend="顶尖水平" />
        <DataCard icon={<Flame className="text-orange-600" />} title="连续学习勋章" value="45" unit="天" trend="历史最高" />
      </div>

      {/* 第一行：认知分布与多维评估 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 雷达图：五维认知评估 */}
        <div className="lg:col-span-5 bg-white rounded-[48px] border border-slate-200 p-10 shadow-sm relative group overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Brain className="text-indigo-600" size={24} /> 认知五维图
            </h3>
            <div className="flex gap-2">
               <button 
                onClick={() => setRadarSeries(prev => prev.includes('Average') ? prev.filter(s => s !== 'Average') : [...prev, 'Average'])}
                className={`text-[10px] font-black px-3 py-1 rounded-lg border transition-all ${radarSeries.includes('Average') ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-400'}`}
               >
                 对比全站平均
               </button>
               <button onClick={() => handleExport('svg', 'radar-chart')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                 <Download size={16} />
               </button>
            </div>
          </div>
          
          <div className="h-72 w-full flex items-center justify-center relative">
            <RadarChart 
              series={radarSeries} 
              dimensions={[
                { key: 'depth', label: '深度思考', value: 85, avg: 60 },
                { key: 'logic', label: '逻辑分析', value: 72, avg: 65 },
                { key: 'breadth', label: '知识广度', value: 94, avg: 55 },
                { key: 'memory', label: '记忆留存', value: 65, avg: 70 },
                { key: 'grit', label: '持续毅力', value: 88, avg: 50 },
              ]}
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-indigo-50/50 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
              <span className="text-xs font-black text-indigo-600">您的能力剖面</span>
            </div>
            {radarSeries.includes('Average') && (
              <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                <span className="text-xs font-black text-slate-400">全站平均基准</span>
              </div>
            )}
          </div>
        </div>

        {/* 热力图：学习强度矩阵 */}
        <div className="lg:col-span-7 bg-white rounded-[48px] border border-slate-200 p-10 shadow-sm relative group overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Calendar className="text-indigo-600" size={24} /> 学习热力矩阵
              </h3>
              <p className="text-xs font-bold text-slate-400">过去 26 周的认知投入频率</p>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={heatmapTheme}
                onChange={(e) => setHeatmapTheme(e.target.value as any)}
                className="bg-slate-50 text-[10px] font-black uppercase px-4 py-2 rounded-xl outline-none border border-slate-200"
              >
                <option value="indigo">靛蓝 (默认)</option>
                <option value="emerald">翡翠 (成长)</option>
                <option value="amber">余晖 (热情)</option>
              </select>
              <button onClick={() => handleExport('svg', 'heatmap')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                <Download size={16} />
              </button>
            </div>
          </div>

          <div className="relative pt-6">
            <Heatmap 
              data={heatmapData} 
              theme={heatmapTheme} 
              onCellHover={setHoveredCell}
            />
            
            {/* 悬停详细数值 */}
            {hoveredCell && (
              <div className="absolute top-0 right-0 p-4 bg-slate-900 text-white rounded-2xl shadow-xl animate-in zoom-in-95 fade-in duration-300 pointer-events-none z-20">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{hoveredCell.date}</p>
                <p className="text-lg font-black mt-1">{hoveredCell.value * 20} 分钟沉浸</p>
                <p className="text-[10px] font-bold text-indigo-400 mt-1">解锁 2 个新思维碎片</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Less</span>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map(v => (
                  <div key={v} className={`w-3.5 h-3.5 rounded-sm bg-current opacity-${(v+1)*20} ${
                    heatmapTheme === 'indigo' ? 'text-indigo-600' : heatmapTheme === 'emerald' ? 'text-emerald-500' : 'text-amber-500'
                  }`} />
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">More</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
               <Info size={14} />
               <span className="text-[10px] font-bold">每日 4:00 AM 同步数据</span>
            </div>
          </div>
        </div>
      </div>

      {/* 第二行：知识领域排行榜 */}
      <section className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">知识领域分布排行</h3>
            <p className="text-slate-500 font-medium">查看您在不同学科领域的掌握程度与投入产出比。</p>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setRankingSort(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl text-xs font-black transition-all hover:bg-slate-100"
             >
               <ArrowUpDown size={14} /> {rankingSort === 'desc' ? '掌握度降序' : '掌握度升序'}
             </button>
             <button onClick={() => handleExport('png', 'ranking-list')} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-slate-200 hover:scale-105 active:scale-95 transition-all">
               导出清单
             </button>
          </div>
        </div>

        <div className="flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">排名 & 领域</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">掌握程度</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">沉浸时长</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">认知趋势</th>
                <th className="px-10 py-5"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedRanking.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                        (idx + (currentPage-1)*itemsPerPage) < 3 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {idx + 1 + (currentPage - 1) * itemsPerPage}
                      </span>
                      <span className="text-lg font-black text-slate-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 min-w-[200px]">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${item.value}%` }} 
                        />
                      </div>
                      <span className="text-sm font-black text-slate-900 tabular-nums">{item.value}%</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-sm font-bold text-slate-500">{item.secondaryValue}</span>
                  </td>
                  <td className="px-10 py-6">
                    <div className={`flex items-center gap-1 font-black text-xs ${item.trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      <TrendingUp size={14} className={item.trend < 0 ? 'rotate-180' : ''} />
                      {Math.abs(item.trend)}%
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-300 hover:text-indigo-600">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页控制器 */}
        <div className="p-8 border-t border-slate-50 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400">显示第 {(currentPage-1)*itemsPerPage+1} - {Math.min(currentPage*itemsPerPage, TOPICS_DATA.length)} 条，共 {TOPICS_DATA.length} 条领域数据</p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-50 text-slate-400'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <ChevronRightIcon size={18} />
            </button>
          </div>
        </div>
      </section>

      

    </div>
  );
};

// --- 子组件：热力图 ---
interface HeatmapProps {
  data: HeatmapData[];
  theme: 'indigo' | 'emerald' | 'amber';
  onCellHover: (cell: HeatmapData | null) => void;
}

const Heatmap: React.FC<HeatmapProps> = ({ data, theme, onCellHover }) => {
  const cellSize = 16;
  const cellGap = 4;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // 映射颜色
  const getIntensityColor = (value: number) => {
    const baseColors = {
      indigo: 'text-indigo-600',
      emerald: 'text-emerald-500',
      amber: 'text-amber-500'
    };
    const opacityMap = ['opacity-5', 'opacity-25', 'opacity-50', 'opacity-75', 'opacity-100'];
    return `${baseColors[theme]} ${opacityMap[value] || 'opacity-5'}`;
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col justify-between py-1 pr-2">
        {days.map((d, i) => (
          <span key={d} className={`text-[9px] font-black uppercase tracking-tight text-slate-300 ${i % 2 === 0 ? 'invisible' : ''}`}>{d}</span>
        ))}
      </div>
      <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
        <div 
          className="grid grid-flow-col gap-[4px]" 
          style={{ gridTemplateRows: `repeat(7, ${cellSize}px)` }}
          onMouseLeave={() => onCellHover(null)}
        >
          {data.map((cell, idx) => (
            <div 
              key={cell.date}
              onMouseEnter={() => onCellHover(cell)}
              className={`w-4 h-4 rounded-sm transition-all duration-300 bg-current hover:ring-2 hover:ring-offset-2 ${
                theme === 'indigo' ? 'hover:ring-indigo-400' : theme === 'emerald' ? 'hover:ring-emerald-400' : 'hover:ring-amber-400'
              } ${getIntensityColor(cell.value)}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-3 px-1 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
           <span>6个月前</span>
           <span>3个月前</span>
           <span>上周</span>
           <span>今天</span>
        </div>
      </div>
    </div>
  );
};

// --- 子组件：雷达图 ---
interface RadarChartProps {
  dimensions: { key: string; label: string; value: number; avg: number }[];
  series: string[];
}

const RadarChart: React.FC<RadarChartProps> = ({ dimensions, series }) => {
  const size = 300;
  const center = size / 2;
  const radius = size * 0.4;
  const numDimensions = dimensions.length;

  const getPoint = (value: number, angle: number) => {
    const r = (radius * value) / 100;
    return {
      x: center + r * Math.cos(angle - Math.PI / 2),
      y: center + r * Math.sin(angle - Math.PI / 2),
    };
  };

  // 坐标系背景
  const gridLines = [0.2, 0.4, 0.6, 0.8, 1].map(scale => {
    const points = Array.from({ length: numDimensions }).map((_, i) => {
      const angle = (i * 2 * Math.PI) / numDimensions;
      const p = getPoint(100 * scale, angle);
      return `${p.x},${p.y}`;
    }).join(' ');
    return points;
  });

  // 生成数据多边形
  const userPath = dimensions.map((d, i) => {
    const angle = (i * 2 * Math.PI) / numDimensions;
    const p = getPoint(d.value, angle);
    return `${p.x},${p.y}`;
  }).join(' ');

  const avgPath = dimensions.map((d, i) => {
    const angle = (i * 2 * Math.PI) / numDimensions;
    const p = getPoint(d.avg, angle);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {/* 轴线背景 */}
      {gridLines.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="#f1f5f9" strokeWidth="1" />
      ))}
      {dimensions.map((d, i) => {
        const angle = (i * 2 * Math.PI) / numDimensions;
        const p = getPoint(100, angle);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#f1f5f9" strokeWidth="1" />;
      })}

      {/* 全站平均层 */}
      {series.includes('Average') && (
        <polygon 
          points={avgPath} 
          fill="rgba(148, 163, 184, 0.1)" 
          stroke="rgba(148, 163, 184, 0.5)" 
          strokeWidth="2" 
          strokeDasharray="4 4"
          className="animate-in fade-in duration-700"
        />
      )}

      {/* 用户数据层 */}
      <polygon 
        points={userPath} 
        fill="rgba(99, 102, 241, 0.2)" 
        stroke="#6366f1" 
        strokeWidth="3" 
        className="transition-all duration-700"
      />

      {/* 标签文字 */}
      {dimensions.map((d, i) => {
        const angle = (i * 2 * Math.PI) / numDimensions;
        const p = getPoint(120, angle);
        return (
          <text 
            key={i} 
            x={p.x} 
            y={p.y} 
            textAnchor="middle" 
            className="text-[10px] font-black fill-slate-400 uppercase tracking-widest"
          >
            {d.label}
          </text>
        );
      })}

      {/* 数据点 */}
      {dimensions.map((d, i) => {
        const angle = (i * 2 * Math.PI) / numDimensions;
        const p = getPoint(d.value, angle);
        return (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#6366f1" strokeWidth="2" className="transition-all duration-700" />
        );
      })}
    </svg>
  );
};

// --- 子组件：基础统计卡片 ---
const DataCard = ({ icon, title, value, unit, trend }: { icon: React.ReactNode; title: string; value: string; unit: string; trend: string }) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
    <div className="p-4 bg-slate-50 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">{icon}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
    <div className="flex items-baseline gap-1 mb-3">
      <span className="text-4xl font-black text-slate-900 tracking-tight">{value}</span>
      <span className="text-sm font-black text-slate-500">{unit}</span>
    </div>
    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg w-fit">
      <TrendingUp size={12} />
      <span className="text-[10px] font-black">{trend}</span>
    </div>
  </div>
);

export default LearningData;
