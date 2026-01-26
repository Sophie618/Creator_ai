import { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, Headphones, Volume2, VolumeX } from 'lucide-react';
import audioUrl from './music/Lisure.mp3';
import imgSnipaste1 from './image/Snipaste1.png';
import imgSnipaste2 from './image/Snipaste2.png';
import imgSnipaste3 from './image/Snipaste3.png';
import imgImage15 from "figma:asset/7172bca543aeb30c088f713e9beefbd0afd8b67f.png";
import imgImage5 from "figma:asset/8b8ffa8f0e6b452130ea24fa30bac74194f70ec9.png";
import imgIcon from "figma:asset/b138a4fee527e695a4b34c84a4ef689b92a34759.png";
import imgIcon1 from "figma:asset/692e9545257c8ec469432671d30d771ef9bc82c6.png";
import imgIcon2 from "figma:asset/e1661fa7a69c0488c00b76c97c2ae984eb931fd8.png";
import imgWechatArticle from "figma:asset/3261a1894c26751c38ed53143b93e21e7546619e.png";
import imgRectangle4 from "figma:asset/0ae6d80c429d8a3359f030e6ba3f331a6b791bca.png";
import imgWechatArticle1 from "figma:asset/1122ffdb65825b29f82599fe552542e5f2be44fb.png";
import imgRectangle5 from "figma:asset/e3a96eb1b4bedeef536ec4721a7a97d1f5f30576.png";
import imgWechatArticle2 from "figma:asset/b43e65b6d6ab4a3bf515ddb676e1e460e3fcfcb0.png";
import imgRectangle6 from "figma:asset/3b46306ea0823d475999da6a540c49c18020b022.png";
import imgRectangle7 from "figma:asset/40ecde8a189d87344820e19d21a8a7502ea03213.png";
import imgWechatArticle3 from "figma:asset/989c1c64ed7e4a8d464985d24e8817ee71652839.png";
import imgRectangle8 from "figma:asset/2ac514bfa2dbecc0d92bc664cb116f0d5cf9dc79.png";
import imgWechatArticle4 from "figma:asset/24a1c15eb119d8e2af39e0ccf7a888ff979fb370.png";
import imgRectangle9 from "figma:asset/6ccb92a9ea833da9c9d483b49a93b205d97264e3.png";
import imgRectangle10 from "figma:asset/9a315c23b85803ea5dc1d8b37699012fc6c556b8.png";
import imgRectangle11 from "figma:asset/56bcb2563f2c041334782d0f6c8b82d203d4106b.png";
import imgFrame4 from "figma:asset/e9f59eda2046f9850e2762abbd456ffe3b593521.png";
import imgFrame5 from "figma:asset/20b9617dcb7c6815f2e42660fde616c4e27281b9.png";
import imgFrame147 from "figma:asset/894a5820df1377ef988047446b8ed273e2df6112.png";

import OptimizedImg from './components/OptimizedImg';

type LoginStep = 'welcome' | 'register' | 'verification' | 'invitation';

function Header({ onOpenLogin, isLoggedIn, onLogout }: { onOpenLogin: () => void; isLoggedIn: boolean; onLogout: () => void }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-[#fdf7ef] to-transparent">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between p-[20px] relative w-full max-w-[1898px] mx-auto">
          <div className="content-stretch flex gap-[5px] items-center relative shrink-0">
            <div className="h-[50px] relative shrink-0 w-[135px]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <OptimizedImg priority alt="Collector+" className="absolute h-[357.14%] left-[-16.2%] max-w-none top-[-128.57%] w-[132.41%]" src={imgImage15} />
              </div>
            </div>
            <div className="h-[32px] relative rounded-[500px] shrink-0 w-[73px]">
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
                <div className="absolute bg-black inset-0 rounded-[500px]" />
                <div className="absolute inset-0 overflow-hidden rounded-[500px]">
                  <OptimizedImg alt="" className="absolute h-full left-[-0.02%] max-w-none top-0 w-[100.03%]" src={imgImage5} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-[15px]">
            <button
              onClick={onOpenLogin}
              className="bg-white relative rounded-[10px] shrink-0 hover:shadow-[0px_4px_15px_0px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <div className="content-stretch flex items-center justify-center overflow-clip px-[20px] py-[8px] relative rounded-[inherit]">
                <p className="css-ew64yg font-['PingFang_SC:Semibold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[18px] text-black">登录</p>
              </div>
              <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.25)] border-solid inset-0 pointer-events-none rounded-[10px]" />
            </button>
            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="relative size-[44px] rounded-full overflow-hidden hover:ring-2 hover:ring-[#408cff] hover:ring-opacity-50 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#408cff] to-[#5ba3ff] flex items-center justify-center">
                    <span className="text-white font-['PingFang_SC:Semibold',sans-serif] text-[18px]">U</span>
                  </div>
                </button>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-50" onClick={() => setShowUserMenu(false)} />
                    <div className="fixed right-[20px] top-[75px] bg-white rounded-[15px] shadow-[0px_4px_25px_0px_rgba(0,0,0,0.15)] overflow-hidden z-50 min-w-[160px]">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full px-[20px] py-[12px] text-left font-['PingFang_SC:Regular',sans-serif] text-[16px] text-[#333] hover:bg-[#f5f5f5] transition-colors"
                      >
                        退出登录
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroIcons() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <div className="col-1 flex items-center justify-center ml-0 mt-[14px] relative row-1 size-[117.323px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "167.828125" } as React.CSSProperties}>
        <div className="flex-none rotate-[339.266deg]">
          <div className="pointer-events-none relative rounded-[20px] size-[91px] cursor-pointer hover:scale-110 transition-transform">
            <OptimizedImg alt="" className="absolute inset-0 max-w-none object-cover rounded-[20px] size-full" src={imgIcon} />
            <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.2)] border-solid inset-0 rounded-[20px] shadow-[0px_4px_25px_0px_rgba(0,0,0,0.25)]" />
          </div>
        </div>
      </div>
      <div className="col-1 ml-[65px] mt-0 pointer-events-none relative rounded-[20px] row-1 size-[91px] cursor-pointer hover:scale-110 transition-transform">
        <OptimizedImg alt="" className="absolute inset-0 max-w-none object-cover rounded-[20px] size-full" src={imgIcon1} />
        <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.2)] border-solid inset-0 rounded-[20px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)]" />
      </div>
      <div className="col-1 flex items-center justify-center ml-[117px] mt-[24px] relative row-1 size-[115.676px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "167.828125" } as React.CSSProperties}>
        <div className="flex-none rotate-[19.007deg]">
          <div className="pointer-events-none relative rounded-[20px] size-[91px] cursor-pointer hover:scale-110 transition-transform">
            <OptimizedImg alt="" className="absolute inset-0 max-w-none object-cover rounded-[20px] size-full" src={imgIcon2} />
            <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.2)] border-solid inset-0 rounded-[20px] shadow-[0px_4px_25px_0px_rgba(0,0,0,0.25)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TypingText() {
  const texts = ['收你想收的', '收公众号', '收 Bilibili'];
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentFullText = texts[textIndex];
    
    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 2000); // 暂停2秒
      return () => clearTimeout(pauseTimer);
    }

    if (!isDeleting && displayText === currentFullText) {
      // 打字完成，暂停
      setIsPaused(true);
      return;
    }

    if (isDeleting && displayText === '') {
      // 删除完成，切换到下一个文本
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const typingSpeed = isDeleting ? 80 : 150;
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // 打字
        setDisplayText(currentFullText.substring(0, displayText.length + 1));
      } else {
        // 删除
        setDisplayText(currentFullText.substring(0, displayText.length - 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, textIndex, isDeleting, isPaused, texts]);

  return (
    <p className="css-ew64yg font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#925400] text-[48px] text-center">
      {displayText}
      <span className="animate-[blink_1s_step-end_infinite] inline-block ml-1">|</span>
    </p>
  );
}

function SearchBar({ onOpenLogin }: { onOpenLogin: () => void }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      alert(`收藏链接: ${url}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="content-stretch flex flex-col gap-[30px] items-center relative shrink-0 w-[873px]">
      <div className="content-stretch flex flex-col gap-[30px] h-[231px] items-center relative shrink-0">
        <HeroIcons />
        <TypingText />
      </div>
      <div className="flex gap-[15px] w-full items-center">
        <div className="bg-white relative rounded-[10px] flex-1">
          <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex items-center p-[5px] relative w-full">
              <div className="flex-[1_0_0] min-h-px min-w-px relative">
                <div className="flex flex-row items-center justify-center size-full">
                  <div className="content-stretch flex items-center justify-center p-[10px] relative w-full">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="粘贴链接"
                      inputMode="url"
                      enterKeyHint="go"
                      className="css-4hzbpn flex-[1_0_0] font-['PingFang_SC:Regular',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#706f6f] text-[20px] bg-transparent border-none outline-none w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenLogin}
          className="bg-[#925400] hover:bg-[#7a4600] text-white font-['PingFang_SC:Medium',sans-serif] text-[18px] px-[40px] py-[12px] rounded-[10px] shadow-[0px_4px_20px_0px_rgba(146,84,0,0.3)] hover:shadow-[0px_6px_25px_0px_rgba(146,84,0,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          立刻体验
        </button>
      </div>
    </form>
  );
}

function AudioWaveform({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-between min-h-px min-w-px relative">
      {[28, 19, 10, 28, 13, 28, 28].map((height, index) => (
        <div key={index} className={`flex h-[${height}px] items-center justify-center relative shrink-0 w-0`} style={{ "--transform-inner-width": "0", "--transform-inner-height": "19" } as React.CSSProperties}>
          <div className="flex-none rotate-[90deg]">
            <div className={`h-0 relative w-[${height}px]`}>
              <div className="absolute inset-[-2px_0_0_0]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={`0 0 ${height} 2`}>
                  <line 
                    stroke="var(--stroke-0, #408CFF)" 
                    strokeLinecap="round" 
                    strokeOpacity={index < 3 ? "0.3" : index === 5 || index === 6 ? "1" : "0.6"} 
                    strokeWidth="2" 
                    x1="1" 
                    x2={height - 1} 
                    y1="1" 
                    y2="1"
                    className={isPlaying ? "animate-pulse" : ""}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const PODCAST_IMAGES = [
  imgSnipaste1,
  imgSnipaste2,
  imgSnipaste3
];

function PodcastPlayer({ date }: { date: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const volumeTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const curr = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(curr);
      if (dur) {
        setDuration(dur);
        setProgress((curr / dur) * 100);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.min(Math.max(x / rect.width, 0), 1);
        audioRef.current.currentTime = percent * duration;
        setProgress(percent * 100);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const setVolumeFromClientY = (clientY: number) => {
    if (!volumeTrackRef.current) return;
    const rect = volumeTrackRef.current.getBoundingClientRect();
    const relative = 1 - (clientY - rect.top) / rect.height;
    const next = Math.min(Math.max(relative, 0), 1);
    setVolume(next);
  };

  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setVolumeFromClientY(e.clientY);
    const onMove = (ev: MouseEvent) => setVolumeFromClientY(ev.clientY);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleVolumeTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches && e.touches[0]) {
      setVolumeFromClientY(e.touches[0].clientY);
    }
  };

  const handleVolumeTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches && e.touches[0]) {
      setVolumeFromClientY(e.touches[0].clientY);
    }
  };

  return (
    <div className="bg-white relative rounded-[10px] shrink-0 w-full overflow-hidden transition-all duration-500 hover:shadow-lg">
      <div className="overflow-clip rounded-[inherit] size-full relative z-10">
        <div className="content-stretch flex flex-col gap-[10px] items-start p-[10px] relative w-full">
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
            <div className="aspect-[235/235.00001525878906] flex-[1_0_0] min-h-px min-w-px relative rounded-[10px] bg-[rgba(64,140,255,0.05)] flex items-center justify-center">
              <span className="text-[#408cff] text-[32px] font-['PingFang_SC:Semibold',sans-serif] tabular-nums slashed-zero">{date}</span>
            </div>
          </div>
          <div className="content-stretch flex gap-[10px] items-center overflow-visible px-0 py-[5px] relative shrink-0 w-full">
            {/* Optimized single-row podcast control */}
            <div className="flex items-center gap-[14px] w-full">
              <button
                onClick={togglePlay}
                className="bg-gradient-to-br from-[#408cff] to-[#5ba3ff] flex items-center justify-center relative rounded-full shrink-0 size-[46px] hover:shadow-[0px_6px_20px_rgba(64,140,255,0.45)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white fill-white" />
                ) : (
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                )}
              </button>
              
              {/* Progress Bar with improved visibility */}
              <div className="flex-1 relative group cursor-pointer h-[10px]" onClick={handleSeek}>
                <div className="bg-[rgba(64,140,255,0.25)] h-[10px] rounded-full w-full overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-[#408cff] via-[#4d96ff] to-[#5ba3ff] h-full rounded-full transition-all duration-300 relative shadow-[0px_0px_8px_rgba(64,140,255,0.3)]"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[16px] h-[16px] bg-white rounded-full shadow-[0px_2px_10px_rgba(64,140,255,0.6)] opacity-0 group-hover:opacity-100 transition-opacity border-2 border-[#408cff]" />
                  </div>
                </div>
              </div>
              
              {/* Time Display with better styling */}
              <span className="text-[14px] font-['PingFang_SC:Medium',sans-serif] text-[#408cff] whitespace-nowrap min-w-[80px] text-right tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Volume Control */}
              <div className="relative flex items-center" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
                <button 
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(64,140,255,0.1)] transition-colors cursor-pointer"
                    onClick={() => setVolume((v: number) => v === 0 ? 1 : 0)}
                >
                    {volume === 0 ? <VolumeX size={18} className="text-[#408cff]" /> : <Volume2 size={18} className="text-[#408cff]" />}
                </button>
                
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-10 h-36 bg-white rounded-[16px] shadow-[0px_4px_25px_0px_rgba(0,0,0,0.15)] flex items-center justify-center px-3 py-4 transition-all duration-200 z-50 ${showVolume ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                  <div 
                    ref={volumeTrackRef}
                    className="relative w-3 h-24 rounded-full bg-[rgba(64,140,255,0.15)] border border-[rgba(64,140,255,0.25)] cursor-pointer"
                    onMouseDown={handleVolumeMouseDown}
                    onTouchStart={handleVolumeTouchStart}
                    onTouchMove={handleVolumeTouchMove}
                  >
                    <div 
                      className="absolute bottom-0 left-0 w-full rounded-b-full bg-gradient-to-t from-[#408cff] to-[#5ba3ff]"
                      style={{ height: `${volume * 100}%` }}
                    />
                    <div 
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{ bottom: `${volume * 100}%` }}
                    >
                      <div className="w-4 h-4 bg-white rounded-full border-2 border-[#408cff] shadow-[0px_2px_10px_rgba(64,140,255,0.6)]" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleTimeUpdate}
      />
      
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[10px] z-20" />
    </div>
  );
}

// Podcast data - 扩展数据以支持滚动
const podcastSources = [
  { icon: imgIcon2, text: "冲上苹果付费榜一的死了么，让我重新思考和AI相处的意义" },
  { icon: imgIcon2, text: "看完影视飓风拍的AI代写，我用NotebookLM复现了工作流，让我重新思考和AI相处的意义" },
  { icon: imgIcon1, icon2: imgIcon2, text: "带着100万...我们去了论文代写聚集地" },
  { icon: imgWechatArticle, text: "从小不写作业的 00 后，3 天做出了 4.5k+ Stars 的开源项目" },
  { icon: imgWechatArticle2, text: "Agent Skills 终极指南：入门、精通、预测" },
  { icon: imgWechatArticle3, text: "4600万围观！Claude两周搓出「Manus」火到宕机" },
];

function SourcesList() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    // 每3秒自动滚动
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % podcastSources.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[180px] overflow-hidden">
      <div 
        className="flex flex-col transition-transform duration-700 ease-in-out"
        style={{ transform: `translateY(-${currentIndex * 60}px)` }}
      >
        {/* 创建循环列表 */}
        {[...podcastSources, ...podcastSources.slice(0, 3)].map((source, index) => (
          <div key={index} className="shrink-0">
            <SourceItem 
              icon={source.icon} 
              icon2={source.icon2}
              text={source.text}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TodaysPodcast() {
  const getDateString = () => {
    const today = new Date();
    return `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
  };
  const [currentDate, setCurrentDate] = useState(getDateString());
  useEffect(() => {
    const schedule = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      const ms = next.getTime() - now.getTime();
      timer = setTimeout(() => {
        setCurrentDate(getDateString());
        schedule();
      }, ms);
    };
    let timer: any;
    schedule();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute content-stretch flex flex-col gap-[10px] items-center left-[359px] p-[10px] top-0 w-[330px] animate-[fadeIn_0.6s_ease-in-out]">
      <div className="font-['Roboto_Mono:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#925400] text-[32px] w-full">
        <p className="css-4hzbpn mb-0">Hi，</p>
        <p className="css-4hzbpn">这是你的今日播客</p>
      </div>
      <div className="bg-white relative rounded-[20px] shadow-[0px_4px_25px_0px_rgba(0,0,0,0.1)] shrink-0 w-full hover:shadow-[0px_6px_30px_0px_rgba(0,0,0,0.15)] transition-shadow duration-300">
        <div className="content-stretch flex flex-col gap-[10px] items-start p-[10px] relative w-full">
          <div className="content-stretch flex gap-[10px] items-center leading-[normal] relative shrink-0 text-[20px] text-black text-center">
            <Headphones className="w-[20px] h-[20px] shrink-0" />
            <p className="css-ew64yg font-['PingFang_SC:Regular',sans-serif] not-italic relative shrink-0">专属播客</p>
          </div>
          <PodcastPlayer date={currentDate} />
          <p className="css-ew64yg font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#a9a9a9] text-[16px]">来源</p>
          <SourcesList />
        </div>
      </div>
    </div>
  );
}

function SourceItem({ icon, icon2, text }: { icon: string; icon2?: string; text: string }) {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full hover:bg-[rgba(0,0,0,0.02)] rounded-lg p-1 transition-colors cursor-pointer">
      <div className="content-stretch flex items-center justify-center relative shrink-0">
        <div className="pointer-events-none relative rounded-[20px] shrink-0 size-[20px]">
          {icon2 ? (
            <div aria-hidden="true" className="absolute inset-0 rounded-[20px]">
              <img alt="" className="absolute max-w-none object-cover rounded-[20px] size-full" src={icon} />
              <img alt="" className="absolute max-w-none object-cover rounded-[20px] size-full" src={icon2} />
            </div>
          ) : (
            <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[20px] size-full" src={icon} />
          )}
          <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 rounded-[20px]" />
        </div>
      </div>
      <p className="css-g0mm18 flex-[1_0_0] font-['PingFang_SC:Regular',sans-serif] leading-[normal] min-h-px min-w-px not-italic overflow-hidden relative text-[#a9a9a9] text-[16px] text-ellipsis">{text}</p>
    </div>
  );
}

function ArticleCard({ image, title, source, sourceIcon, rotation = "0deg", top, left, isHovered, index }: any) {
  // 计算默认垂直位置
  const defaultTop = `${index * 110}px`;
  const defaultLeft = "10px";
  
  // 优化旋转角度：如果角度大于180度，转换为负角度
  const optimizeRotation = (rot: string) => {
    const angle = parseFloat(rot);
    if (angle > 180) {
      return `${angle - 360}deg`;
    }
    return rot;
  };
  
  const optimizedRotation = optimizeRotation(rotation);
  
  return (
    <div 
      className={`absolute flex items-center justify-center transition-all duration-500 ease-out`} 
      style={{ 
        top: isHovered ? top : defaultTop, 
        left: isHovered ? left : defaultLeft,
      }}
    >
      <div 
        className="bg-white content-stretch flex gap-[10px] h-[100px] items-start overflow-clip p-[10px] relative rounded-[20px] shadow-[0px_4px_25px_0px_rgba(0,0,0,0.15)] w-[330px] hover:shadow-[0px_8px_35px_0px_rgba(0,0,0,0.2)] transition-all duration-500 ease-out cursor-pointer"
        style={{
          transform: `rotate(${isHovered ? optimizedRotation : '0deg'})`
        }}
      >
        <div className="aspect-[149/79] h-full relative rounded-[10px] shrink-0">
          <OptimizedImg alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={image} />
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] h-full items-start min-h-px min-w-px relative">
          <p className="css-4hzbpn font-['PingFang_SC:Regular',sans-serif] leading-[1.4] not-italic overflow-hidden text-[15px] text-black w-full line-clamp-2">{title}</p>
          <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full">
            <div className="relative rounded-[20px] shrink-0 size-[20px]">
              <OptimizedImg alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[20px] size-full" src={sourceIcon} />
            </div>
            <p className="css-ew64yg font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-black">{source}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticlesList() {
  const [isHovered, setIsHovered] = useState(false);
  
  const articles = [
    { image: imgRectangle4, title: "看完影视飓风拍的AI代写，我用NotebookLM复现了工作流", source: "卡尔的 AI 沃茨", sourceIcon: imgWechatArticle, rotation: "0deg", top: "10px", left: "13px" },
    { image: imgRectangle5, title: "问打通阿里生态后，么？", source: "十字路口 Crossing", sourceIcon: imgWechatArticle1, rotation: "5.76deg", top: "120px", left: "12.39px" },
    { image: imgRectangle6, title: "从小不写作业的 00 后，3 天做出了 4.5k+ Stars 的开源项目", source: "观猹人物", sourceIcon: imgWechatArticle2, rotation: "6.365deg", top: "230px", left: "0.86px" },
    { image: imgRectangle7, title: "Cursor For Designer", source: "Cursor - Youtube", sourceIcon: imgIcon, rotation: "357.642deg", top: "340px", left: "6px" },
    { image: imgRectangle8, title: "Agent Skills 终极指南：入门、精通、预测", source: "一泽 Eze", sourceIcon: imgWechatArticle3, rotation: "3.002deg", top: "450px", left: "0px" },
    { image: imgRectangle9, title: "4600万围观！Claude两周搓出「Manus」火到宕机：0行代码是人写，创业公司集体破防", source: "Appso", sourceIcon: imgWechatArticle4, rotation: "357.499deg", top: "560px", left: "3px" },
    { image: imgRectangle10, title: "【Midjourney教程】莱森的保姆级AI绘画创作系列教学课程", source: "莱森 LysonOber 哔哩哔哩", sourceIcon: imgIcon1, rotation: "3.017deg", top: "670px", left: "3px" },
    { image: imgRectangle11, title: "带着100万...我们去了论文代写聚集地", source: "影视飓风 - 哔哩哔哩", sourceIcon: imgIcon1, rotation: "0deg", top: "780px", left: "6px" },
  ];

  return (
    <div 
      className="absolute h-[890px] left-0 top-0 w-[351px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {articles.map((article, index) => (
        <ArticleCard key={index} {...article} index={index} isHovered={isHovered} />
      ))}
    </div>
  );
}

function SurveyCard({ question, bgColor, gradientColor, image, top }: any) {
  const [selected, setSelected] = useState<'yes' | 'no' | null>(null);

  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center overflow-clip rounded-[20px] shadow-[0px_4px_25px_0px_rgba(0,0,0,0.1)] w-[310px]" style={{ backgroundColor: bgColor, top }}>
      <div className="h-[164px] relative shrink-0 w-full">
        <OptimizedImg alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={image} />
        <div className="absolute bg-gradient-to-b bottom-0 content-stretch flex flex-col from-[rgba(255,255,255,0)] gap-[10px] items-start left-0 px-[20px] py-0 w-[310px]" style={{ background: `linear-gradient(to bottom, rgba(255,255,255,0), ${gradientColor} 85%)` }}>
          <div className="shrink-0 size-[40px]" />
          <p className="css-4hzbpn font-['PingFang_SC:Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[20px] text-black w-[min-content]">{question}</p>
        </div>
      </div>
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row justify-center size-full">
          <div className="content-stretch flex gap-[10px] items-start justify-center p-[20px] relative w-full">
            <button
              onClick={() => setSelected('yes')}
              className={`bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[50px] hover:scale-105 transition-transform ${selected === 'yes' ? 'ring-2 ring-[#408cff]' : ''}`}
            >
              <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex items-center justify-center px-[30px] py-[10px] relative w-full">
                  <p className="css-ew64yg font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">是</p>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.2)] border-solid inset-0 pointer-events-none rounded-[50px]" />
            </button>
            <button
              onClick={() => setSelected('no')}
              className={`bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[50px] hover:scale-105 transition-transform ${selected === 'no' ? 'ring-2 ring-[#408cff]' : ''}`}
            >
              <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex items-center justify-center px-[30px] py-[10px] relative w-full">
                  <p className="css-ew64yg font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-black">否</p>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.2)] border-solid inset-0 pointer-events-none rounded-[50px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SurveyCards() {
  return (
    <div className="absolute top-0 right-0 w-[310px]">
      <SurveyCard
        question="你认为中国 AI 超越美国的可能性有 50% 以上吗？"
        bgColor="#f2e2be"
        gradientColor="#f2e2be"
        image={imgRectangle5}
        top="0px"
      />
      <SurveyCard
        question={'你觉得：在当下这个时间点，中国 AI 初创公司要想上市，必须有"创始人光环"和天价估值才有机会吗？'}
        bgColor="#fb9693"
        gradientColor="#fb9491"
        image={imgFrame4}
        top="276px"
      />
      <SurveyCard
        question="大模型要想普惠，不开源也不要紧，只要几家巨头做得足够强就够了？"
        bgColor="#bfbfbd"
        gradientColor="#bfbfbd"
        image={imgFrame5}
        top="552px"
      />
    </div>
  );
}

function ModalLogo() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <div className="h-[44px] relative shrink-0 w-[118px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <OptimizedImg alt="Collector+" className="absolute h-[357.14%] left-[-16.2%] max-w-none top-[-128.57%] w-[132.41%]" src={imgImage15} />
        </div>
      </div>
      <div className="h-[28px] relative rounded-[500px] shrink-0 w-[64px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[500px]">
          <div className="absolute bg-black inset-0 rounded-[500px]" />
          <div className="absolute inset-0 overflow-hidden rounded-[500px]">
            <OptimizedImg alt="" className="absolute h-full left-[-0.02%] max-w-none top-0 w-[100.03%]" src={imgImage5} />
          </div>
        </div>
      </div>
    </div>
  );
}

function VerificationCodeInput({ value, onChange, index }: { value: string; onChange: (value: string, index: number) => void; index: number }) {
  return (
    <input
      type="text"
      maxLength={1}
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        if (/^[0-9]?$/.test(val)) {
          onChange(val, index);
          if (val && index < 5) {
            const nextInput = document.getElementById(`code-input-${index + 1}`);
            nextInput?.focus();
          }
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Backspace' && !value && index > 0) {
          const prevInput = document.getElementById(`code-input-${index - 1}`);
          prevInput?.focus();
        }
      }}
      id={`code-input-${index}`}
      className="bg-white flex-[1_0_0] h-[54px] min-h-px min-w-px relative rounded-[16px] text-center text-[24px] font-['PingFang_SC:Semibold',sans-serif] text-black border border-[rgba(0,0,0,0.1)] outline-none focus:border-[#408cff] focus:ring-2 focus:ring-[#408cff] focus:ring-opacity-20 transition-all"
    />
  );
}

function LoginModal({ isOpen, onClose, onLoginSuccess, onInvitationComplete, initialStep = 'welcome' }: { isOpen: boolean; onClose: () => void; onLoginSuccess: () => void; onInvitationComplete: () => void; initialStep?: LoginStep }) {
  const [step, setStep] = useState<LoginStep>(initialStep);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [invitationCode, setInvitationCode] = useState(['', '', '', '', '', '']);

  // 当 initialStep 改变时更新 step
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
    }
  }, [initialStep, isOpen]);

  // 当弹窗关闭且 initialStep 为 'welcome' 时重置所有状态
  useEffect(() => {
    if (!isOpen && initialStep === 'welcome') {
      // 使用 setTimeout 确保动画完成后再重置
      const timer = setTimeout(() => {
        setStep('welcome');
        setEmail('');
        setPassword('');
        setVerificationCode(['', '', '', '', '', '']);
        setInvitationCode(['', '', '', '', '', '']);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialStep]);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (email) {
      setStep('register');
    }
  };

  const handleRegister = () => {
    if (password) {
      setStep('verification');
    }
  };

  const handleVerification = () => {
    const code = verificationCode.join('');
    if (code.length === 6) {
      onLoginSuccess(); // 完成验证码后就显示头像
      setStep('invitation');
    }
  };

  const handleInvitation = () => {
    const code = invitationCode.join('');
    if (code.length === 6) {
      onLoginSuccess();
      onInvitationComplete();
      onClose();
      // 重置状态
      setStep('welcome');
      setEmail('');
      setPassword('');
      setVerificationCode(['', '', '', '', '', '']);
      setInvitationCode(['', '', '', '', '', '']);
      // 跳转到创空间链接（PC 与移动端通用）
      window.location.assign('https://modelscope.cn/studios/Sophie88888/collector_plus');
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
  };

  const handleInvitationChange = (value: string, index: number) => {
    const newCode = [...invitationCode];
    newCode[index] = value;
    setInvitationCode(newCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(34,34,34,0.1)]" onClick={onClose}>
      <div 
        className="bg-[#fdf7ef] h-[520px] rounded-[30px] w-[780px] shadow-[0px_4px_25px_0px_rgba(0,0,0,0.1)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="content-stretch flex items-start overflow-clip relative rounded-[inherit] size-full">
          {/* Left Image */}
          <div className="flex-[1_0_0] h-full min-h-px min-w-px relative">
            <OptimizedImg alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFrame147} />
          </div>

          {/* Right Content */}
          <div className="flex-[1_0_0] h-full min-h-px min-w-px relative">
            <div className="flex flex-col justify-center size-full">
              <div className="content-stretch flex flex-col gap-[18px] items-start justify-center p-[32px] relative size-full">
                {step === 'welcome' && (
                  <>
                    <ModalLogo />
                    <p className="css-ew64yg font-['PingFang_SC:Semibold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[22px] text-black">
                      欢迎来到「收藏加」
                    </p>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="输入你的邮箱"
                      className="bg-white relative rounded-[16px] shrink-0 w-full p-[12px] text-[15px] font-['PingFang_SC:Regular',sans-serif] text-[#706f6f] placeholder:text-[#a0a0a0] border border-[rgba(0,0,0,0.1)] outline-none focus:border-[#408cff] transition-all"
                    />
                    <button
                      onClick={handleContinue}
                      className="bg-black relative rounded-[16px] shrink-0 w-full hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                        <div className="content-stretch flex items-center justify-center p-[12px] relative w-full">
                          <p className="css-ew64yg font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[15px] text-white">继续</p>
                        </div>
                      </div>
                    </button>
                  </>
                )}

                {step === 'register' && (
                  <>
                    <ModalLogo />
                    <p className="css-ew64yg font-['PingFang_SC:Semibold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[22px] text-black">
                      让我们开始注册
                    </p>
                    <div className="bg-white relative rounded-[16px] shrink-0 w-full p-[12px] text-[15px] font-['PingFang_SC:Regular',sans-serif] text-[#706f6f] border border-[rgba(0,0,0,0.1)]">
                      {email}
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="输入密码"
                      className="bg-white relative rounded-[16px] shrink-0 w-full p-[12px] text-[15px] font-['PingFang_SC:Regular',sans-serif] text-[#706f6f] placeholder:text-[#a0a0a0] border border-[rgba(0,0,0,0.1)] outline-none focus:border-[#408cff] transition-all"
                    />
                    <button
                      onClick={handleRegister}
                      className="bg-black relative rounded-[16px] shrink-0 w-full hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                        <div className="content-stretch flex items-center justify-center p-[12px] relative w-full">
                          <p className="css-ew64yg font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[15px] text-white">登录 / 注册</p>
                        </div>
                      </div>
                    </button>
                    <p className="css-4hzbpn font-['PingFang_SC:Regular',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#706f6f] text-[13px] text-center w-[min-content]">
                      未登录用户将自动注册
                    </p>
                  </>
                )}

                {step === 'verification' && (
                  <>
                    <button
                      onClick={() => setStep('register')}
                      className="content-stretch flex gap-[5px] items-center leading-[normal] relative shrink-0 text-[13px] text-black hover:text-[#408cff] transition-colors"
                    >
                      <ChevronLeft className="w-[16px] h-[16px] shrink-0" />
                      <p className="css-ew64yg font-['PingFang_SC:Semibold',sans-serif] not-italic relative shrink-0">返回</p>
                    </button>
                    <div className="content-stretch flex flex-col gap-[16px] items-center justify-center relative shrink-0 w-full">
                      <p className="css-4hzbpn font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#706f6f] text-[13px] text-center w-full">
                        <span className="leading-[normal]">请检查来自邮箱 </span>
                        <span className="font-['PingFang_SC:Semibold',sans-serif] leading-[normal]">{email} </span>
                        <span className="leading-[normal]">的验证码</span>
                      </p>
                      <div className="content-stretch flex gap-[6px] items-start relative shrink-0 w-full">
                        {verificationCode.map((code, index) => (
                          <VerificationCodeInput
                            key={index}
                            value={code}
                            onChange={handleCodeChange}
                            index={index}
                          />
                        ))}
                      </div>
                      <div className="content-stretch flex flex-col font-['PingFang_SC:Regular',sans-serif] items-start not-italic relative shrink-0 text-[#706f6f] text-[13px] text-center w-full">
                        <p className="css-4hzbpn leading-[normal] relative shrink-0 w-full">收件箱和垃圾邮件箱里都没有邮件？</p>
                        <p className="css-4hzbpn leading-[normal] relative shrink-0 w-full">
                          让我们<button className="text-[#408cff] underline hover:text-[#3070cc] transition-colors">重新发送</button>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleVerification}
                      className="bg-black relative rounded-[16px] shrink-0 w-full hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                        <div className="content-stretch flex items-center justify-center p-[12px] relative w-full">
                          <p className="css-ew64yg font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[15px] text-white">注册</p>
                        </div>
                      </div>
                    </button>
                  </>
                )}

                {step === 'invitation' && (
                  <>
                    <ModalLogo />
                    <p className="css-ew64yg font-['PingFang_SC:Semibold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[22px] text-black">
                      👋 你好 天使用户
                    </p>
                    <div className="content-stretch flex flex-col gap-[16px] items-center justify-center relative shrink-0 w-full">
                      <p className="css-4hzbpn font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#706f6f] text-[13px] text-center w-full">
                        输入邀请码
                      </p>
                      <div className="content-stretch flex gap-[6px] items-start relative shrink-0 w-full">
                        {invitationCode.map((code, index) => (
                          <VerificationCodeInput
                            key={index}
                            value={code}
                            onChange={handleInvitationChange}
                            index={index}
                          />
                        ))}
                      </div>
                      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                        <p className="css-4hzbpn font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#706f6f] text-[13px] text-center w-full">
                          我没有邀请码，加入 <button className="text-[#408cff] underline hover:text-[#3070cc] transition-colors">候补列表</button>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleInvitation}
                      className="bg-black relative rounded-[16px] shrink-0 w-full hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                        <div className="content-stretch flex items-center justify-center p-[12px] relative w-full">
                          <p className="css-ew64yg font-['PingFang_SC:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[15px] text-white">进入</p>
                        </div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.25)] border-solid inset-0 pointer-events-none rounded-[30px]" />
      </div>
    </div>
  );
}

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasInvitationCode, setHasInvitationCode] = useState(false);
  const [loginInitialStep, setLoginInitialStep] = useState<LoginStep>('welcome');

  const handleLogin = () => {
    // 如果已登录但没有邀请码，直接打开邀请码页面
    if (isLoggedIn && !hasInvitationCode) {
      setLoginInitialStep('invitation');
    } else {
      setLoginInitialStep('welcome');
    }
    setIsLoginOpen(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setHasInvitationCode(false);
  };

  const handleInvitationComplete = () => {
    setHasInvitationCode(true);
  };

  return (
    <div className="bg-[#fdf7ef] min-h-screen flex flex-col items-center overflow-x-hidden">
      <Header onOpenLogin={handleLogin} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="pt-[90px] content-stretch flex flex-col gap-[30px] items-center p-[50px] relative w-full max-w-[1898px]">
        <SearchBar onOpenLogin={handleLogin} />
        <div className="h-[890px] relative shrink-0 w-[1023px]">
          <TodaysPodcast />
          <ArticlesList />
          <SurveyCards />
        </div>
      </div>
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={() => setIsLoggedIn(true)} 
        onInvitationComplete={handleInvitationComplete}
        initialStep={loginInitialStep}
      />
    </div>
  );
}
